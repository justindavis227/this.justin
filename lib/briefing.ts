import { supabaseAdmin } from '@/lib/supabase'
import { calcStreak } from '@/lib/habits'
import Anthropic from '@anthropic-ai/sdk'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'

interface BriefingFacts {
  date: string
  events: { title: string; start_at: string | null; all_day: boolean; source: string }[]
  tasks: { title: string; tier: string; space_slug: string | null; is_key: boolean }[]
  captures: { summary: string; kind: string; created_at: string }[]
  habits: { label: string; streak: number; cadence: string }[]
}

const BRIEFING_PROMPT = `You are Justin Davis's morning-briefing voice. Justin is a Youth Pastor (Southeast Christian Church, Louisville), reseller, and tool builder. He reads this once each morning on his phone.

Given the structured facts below, write a short briefing — 4–6 lines max, plain text, no markdown bullets, no headers. Lead with the most important thing on his plate today, then weave in calendar, key tasks, and habit streaks. Skip filler. Conversational but terse.

Example tone:
"Heavy day. CMT at 9, leader huddle at 6. 3 Now tasks open — the Sunday series outline is the one that has to move. Scripture streak at 12, train streak at 4 — gym was missed yesterday."

Return ONLY the briefing text, no preamble.`

export async function gatherFacts(today: Date = new Date()): Promise<BriefingFacts> {
  const db = supabaseAdmin()
  const dayStart = startOfDay(today).toISOString()
  const dayEnd = endOfDay(today).toISOString()
  const dateStr = format(today, 'yyyy-MM-dd')
  const lookback = subDays(today, 2).toISOString()

  const [eventsRes, tasksRes, capturesRes, habitsRes, logsRes] = await Promise.all([
    db.from('calendar_events')
      .select('title, start_at, all_day, source')
      .gte('start_at', dayStart)
      .lte('start_at', dayEnd)
      .order('start_at'),
    db.from('tasks')
      .select('title, tier, space_slug, is_key, priority_score')
      .is('completed_at', null)
      .in('tier', ['now', 'soon'])
      .order('priority_score', { ascending: false })
      .limit(8),
    db.from('captures')
      .select('classification, created_at')
      .gte('created_at', lookback)
      .order('created_at', { ascending: false })
      .limit(8),
    db.from('habits').select('*').eq('active', true).order('sort_order'),
    db.from('habit_log').select('habit_slug, log_date').gte('log_date', format(subDays(today, 90), 'yyyy-MM-dd')).eq('done', true),
  ])

  const logsByHabit = new Map<string, Set<string>>()
  for (const l of logsRes.data ?? []) {
    if (!logsByHabit.has(l.habit_slug)) logsByHabit.set(l.habit_slug, new Set())
    logsByHabit.get(l.habit_slug)!.add(l.log_date)
  }

  const habits = (habitsRes.data ?? []).map(h => ({
    label: h.label as string,
    cadence: h.cadence as string,
    streak: calcStreak(h.cadence, h.target_per_week, logsByHabit.get(h.slug) ?? new Set(), today),
  }))

  const captures = (capturesRes.data ?? [])
    .map(c => {
      const cls = c.classification as { summary?: string; kind?: string } | null
      return cls?.summary
        ? { summary: cls.summary, kind: cls.kind ?? 'note', created_at: c.created_at as string }
        : null
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)

  return {
    date: dateStr,
    events: (eventsRes.data ?? []).map(e => ({
      title: e.title as string,
      start_at: e.start_at as string | null,
      all_day: e.all_day as boolean,
      source: e.source as string,
    })),
    tasks: (tasksRes.data ?? []).map(t => ({
      title: t.title as string,
      tier: t.tier as string,
      space_slug: t.space_slug as string | null,
      is_key: t.is_key as boolean,
    })),
    captures,
    habits,
  }
}

export async function generateBriefing(facts: BriefingFacts): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const factsText = [
    `Date: ${facts.date}`,
    '',
    `Calendar (${facts.events.length}):`,
    ...facts.events.map(e => {
      const time = e.all_day ? 'all day' : (e.start_at ? format(new Date(e.start_at), 'h:mma') : '')
      return `  - ${time} ${e.title} (${e.source})`
    }),
    '',
    `Open Now/Soon tasks (${facts.tasks.length}):`,
    ...facts.tasks.map(t => `  - [${t.tier}${t.is_key ? '/key' : ''}${t.space_slug ? ` · ${t.space_slug}` : ''}] ${t.title}`),
    '',
    `Recent captures (${facts.captures.length}):`,
    ...facts.captures.map(c => `  - (${c.kind}) ${c.summary}`),
    '',
    `Habit streaks:`,
    ...facts.habits.map(h => `  - ${h.label}: ${h.streak} ${h.cadence === 'daily' ? 'day' : 'week'} streak`),
  ].join('\n')

  const msg = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: `${BRIEFING_PROMPT}\n\n${factsText}` }],
  })

  const c = msg.content[0]
  return c.type === 'text' ? c.text.trim() : ''
}
