import { supabaseAdmin } from '@/lib/supabase'
import { Task } from '@/lib/types'
import WeekTabsClient from '@/components/thisweek/WeekTabsClient'

export const revalidate = 30

async function getTasks(): Promise<Task[]> {
  const db = supabaseAdmin()
  const { data } = await db
    .from('tasks')
    .select('*')
    .is('completed_at', null)
    .order('priority_score', { ascending: false })
    .order('created_at', { ascending: false })
  return (data ?? []) as Task[]
}

export default async function ThisWeekPage() {
  const tasks = await getTasks().catch(() => [] as Task[])

  const nowH = new Date().getHours()
  const greet = nowH < 12 ? 'Good morning' : nowH < 18 ? 'Good afternoon' : 'Good evening'
  const nowCount = tasks.filter(t => t.tier === 'now').length

  return (
    <div className="content-inner">
      <div className="section" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', margin: '0 0 4px' }}>
          {greet}, Justin.
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          {tasks.length} tasks. {nowCount} need you now.
        </p>
      </div>

      <WeekTabsClient tasks={tasks} />
    </div>
  )
}
