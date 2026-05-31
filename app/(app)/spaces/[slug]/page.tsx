import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import WorkSpace from '@/components/spaces/WorkSpace'
import PersonalSpace from '@/components/spaces/PersonalSpace'
import ResellSpace from '@/components/spaces/ResellSpace'
import BuildSpace from '@/components/spaces/BuildSpace'
import type { Task, Capture, CalendarEvent } from '@/lib/types'
import type { FocusItemData } from '@/components/spaces/shared/FocusList'
import { format, parseISO, startOfDay, addDays } from 'date-fns'

export const revalidate = 60

// Legacy leaf slugs → redirect to the consolidated parent + tab.
const REDIRECT_MAP: Record<string, { parent: string; tab: string }> = {
  southeast: { parent: 'work',     tab: 'southeast' },
  students:  { parent: 'work',     tab: 'students'  },
  family:    { parent: 'personal', tab: 'family'    },
  finance:   { parent: 'personal', tab: 'finance'   },
  journal:   { parent: 'personal', tab: 'journal'   },
  health:    { parent: 'personal', tab: 'health'    },
  // Resell + Build legacy children
  sourcing:    { parent: 'resell', tab: 'sourcing'    },
  listings:    { parent: 'resell', tab: 'listings'    },
  experiments: { parent: 'build',  tab: 'experiments' },
  brandkit:    { parent: 'build',  tab: 'brandkit'    },
}

const STATUS_FROM_TIER: Record<string, 'active' | 'attention' | 'idle' | 'idea'> = {
  now: 'attention', soon: 'active', later: 'idle', someday: 'idea',
}

export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Redirect legacy children to parent + tab
  if (slug in REDIRECT_MAP) {
    const { parent, tab } = REDIRECT_MAP[slug]
    redirect(`/spaces/${parent}?tab=${tab}`)
  }

  const db = supabaseAdmin()

  if (slug === 'work') {
    const today = new Date()
    const ahead = addDays(today, 14).toISOString()

    const [tasksRes, studentsTasksRes] = await Promise.all([
      db.from('tasks').select('*').in('space_slug', ['southeast', 'students'])
        .is('completed_at', null).order('priority_score', { ascending: false }).limit(8),
      db.from('tasks').select('*').eq('space_slug', 'students')
        .is('completed_at', null).order('priority_score', { ascending: false }).limit(8),
    ])

    const tasks = (tasksRes.data ?? []) as Task[]
    const studentsTasks = (studentsTasksRes.data ?? []) as Task[]

    const needsYouThisWeek: FocusItemData[] = tasks.map(t => ({
      id: t.id,
      title: t.title,
      subtitle: t.description ?? undefined,
      status: STATUS_FROM_TIER[t.tier],
      contextTag: t.space_slug ?? undefined,
    }))
    const studentsThisWeek: FocusItemData[] = studentsTasks.map(t => ({
      id: t.id,
      title: t.title,
      subtitle: t.description ?? undefined,
      status: STATUS_FROM_TIER[t.tier],
    }))

    return <WorkSpace needsYouThisWeek={needsYouThisWeek} studentsThisWeek={studentsThisWeek} />
  }

  if (slug === 'personal') {
    const today = new Date()
    const ahead = addDays(today, 30)

    const [tasksRes, capturesRes, familyEventsRes] = await Promise.all([
      db.from('tasks')
        .select('*')
        .in('space_slug', ['family', 'finance', 'journal', 'health'])
        .is('completed_at', null)
        .order('priority_score', { ascending: false })
        .limit(8),
      db.from('captures')
        .select('id, classification, raw_text, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
      db.from('calendar_events')
        .select('*')
        .eq('source', 'apple_family')
        .gte('start_at', startOfDay(today).toISOString())
        .lte('start_at', ahead.toISOString())
        .order('start_at')
        .limit(10),
    ])

    const tasks = (tasksRes.data ?? []) as Task[]
    const captures = (capturesRes.data ?? []) as Capture[]
    const familyEvents = (familyEventsRes.data ?? []) as CalendarEvent[]

    const onYourPlate: FocusItemData[] = [
      ...tasks.slice(0, 5).map<FocusItemData>(t => ({
        id: t.id,
        title: t.title,
        subtitle: t.description ?? undefined,
        status: STATUS_FROM_TIER[t.tier],
        contextTag: t.space_slug ?? undefined,
      })),
      ...captures
        .filter(c => {
          const slug = c.classification?.space_slug
          return slug && ['family', 'finance', 'journal', 'health'].includes(slug)
        })
        .slice(0, 3)
        .map<FocusItemData>(c => ({
          id: c.id,
          title: c.classification?.summary ?? c.raw_text?.slice(0, 80) ?? 'Capture',
          subtitle: format(parseISO(c.created_at), 'MMM d'),
          status: 'idea' as const,
          contextTag: c.classification?.space_slug ?? undefined,
        })),
    ]

    const familyComingUp: FocusItemData[] = familyEvents.map(e => ({
      id: e.id,
      title: e.title,
      subtitle: e.location ?? undefined,
      leftText: e.start_at ? format(parseISO(e.start_at), 'EEE MMM d') : undefined,
      rightText: e.start_at && !e.all_day ? format(parseISO(e.start_at), 'h:mma') : (e.all_day ? 'All day' : undefined),
    }))

    return <PersonalSpace onYourPlate={onYourPlate} familyComingUp={familyComingUp} />
  }

  if (slug === 'resell') return <ResellSpace />
  if (slug === 'build')  return <BuildSpace />

  // Fallback: try to render the space label and show empty state
  const { data: space } = await db.from('spaces').select('slug, label').eq('slug', slug).maybeSingle()
  const label = space?.label ?? slug
  return (
    <div className="content-inner">
      <div className="section">
        <div className="section-head">
          <span className="section-eyebrow">{label}</span>
        </div>
        <div className="empty" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
          This space doesn’t have a dedicated dashboard yet.
        </div>
      </div>
    </div>
  )
}
