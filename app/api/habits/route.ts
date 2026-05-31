import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { calcStreak, fmtDate, HabitDef } from '@/lib/habits'
import { startOfWeek, addDays, subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const db = supabaseAdmin()
  const today = new Date()
  const heatmapStart = subDays(today, 29)

  const [habitsRes, logsRes] = await Promise.all([
    db.from('habits').select('*').eq('active', true).order('sort_order'),
    db.from('habit_log')
      .select('habit_slug, log_date, done')
      .gte('log_date', fmtDate(heatmapStart))
      .eq('done', true),
  ])

  if (habitsRes.error) return Response.json({ error: habitsRes.error.message }, { status: 500 })
  if (logsRes.error) return Response.json({ error: logsRes.error.message }, { status: 500 })

  const habits = (habitsRes.data ?? []) as HabitDef[]
  const logs = logsRes.data ?? []

  const logsByHabit = new Map<string, Set<string>>()
  for (const l of logs) {
    if (!logsByHabit.has(l.habit_slug)) logsByHabit.set(l.habit_slug, new Set())
    logsByHabit.get(l.habit_slug)!.add(l.log_date)
  }

  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => fmtDate(addDays(weekStart, i)))

  const habitsOut = habits.map(h => {
    const set = logsByHabit.get(h.slug) ?? new Set<string>()
    const week: Record<string, boolean> = {}
    for (const d of weekDays) week[d] = set.has(d)
    return {
      slug: h.slug,
      label: h.label,
      cadence: h.cadence,
      target_per_week: h.target_per_week,
      week,
      streak: calcStreak(h.cadence, h.target_per_week, set, today),
    }
  })

  const heatmap: Record<string, number> = {}
  const activeCount = habits.length || 1
  for (let i = 0; i < 30; i++) {
    const d = fmtDate(addDays(heatmapStart, i))
    let c = 0
    for (const s of logsByHabit.values()) if (s.has(d)) c++
    heatmap[d] = c / activeCount
  }

  return Response.json({ habits: habitsOut, heatmap })
}
