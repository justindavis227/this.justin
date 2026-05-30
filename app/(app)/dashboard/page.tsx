import { supabaseAdmin } from '@/lib/supabase'
import { Task, Goal, CalendarEvent } from '@/lib/types'
import OperatorCard from '@/components/dashboard/OperatorCard'
import GoalsCard from '@/components/dashboard/GoalsCard'
import CalendarCard from '@/components/dashboard/CalendarCard'
import MacrosCard from '@/components/dashboard/MacrosCard'
import HabitsCard from '@/components/dashboard/HabitsCard'
import FinanceCard from '@/components/dashboard/FinanceCard'
import { startOfDay, endOfDay, addDays, format } from 'date-fns'

export const revalidate = 60

async function getDashboardData() {
  const db = supabaseAdmin()
  const today = new Date()
  const weekEnd = addDays(today, 7)

  const [tasksRes, goalsRes, eventsRes] = await Promise.all([
    db.from('tasks')
      .select('*')
      .is('completed_at', null)
      .in('tier', ['now', 'soon'])
      .order('priority_score', { ascending: false })
      .limit(10),
    db.from('goals').select('*').order('created_at'),
    db.from('calendar_events')
      .select('*')
      .gte('start_at', today.toISOString())
      .lte('start_at', weekEnd.toISOString())
      .order('start_at'),
  ])

  return {
    tasks: (tasksRes.data ?? []) as Task[],
    goals: (goalsRes.data ?? []) as Goal[],
    events: (eventsRes.data ?? []) as CalendarEvent[],
  }
}

export default async function DashboardPage() {
  const { tasks, goals, events } = await getDashboardData().catch(() => ({
    tasks: [] as Task[],
    goals: [] as Goal[],
    events: [] as CalendarEvent[],
  }))

  const nowTasks = tasks.filter(t => t.tier === 'now')
  const annualGoals = goals.filter(g => g.scope === 'annual')
  const quarterGoals = goals.filter(g => g.scope === 'quarter')

  return (
    <div className="content-inner dash">
      <div className="dash-grid">
        <OperatorCard nowTasks={nowTasks} streakDays={0} />
        <GoalsCard annualGoals={annualGoals} quarterGoals={quarterGoals} />
        <CalendarCard events={events} />
        <MacrosCard />
        <HabitsCard />
        <FinanceCard />
      </div>
    </div>
  )
}
