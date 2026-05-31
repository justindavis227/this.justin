import { supabaseAdmin } from '@/lib/supabase'
import { Task, Goal } from '@/lib/types'
import OperatorCard from '@/components/dashboard/OperatorCard'
import GoalsCard from '@/components/dashboard/GoalsCard'
import CalendarCard from '@/components/dashboard/CalendarCard'
import MacrosCard from '@/components/dashboard/MacrosCard'
import HabitsCard from '@/components/dashboard/HabitsCard'
import FinanceCard from '@/components/dashboard/FinanceCard'

export const revalidate = 60

async function getDashboardData() {
  const db = supabaseAdmin()

  const [tasksRes, goalsRes] = await Promise.all([
    db.from('tasks')
      .select('*')
      .is('completed_at', null)
      .in('tier', ['now', 'soon'])
      .order('priority_score', { ascending: false })
      .limit(10),
    db.from('goals').select('*').order('created_at'),
  ])

  return {
    tasks: (tasksRes.data ?? []) as Task[],
    goals: (goalsRes.data ?? []) as Goal[],
  }
}

export default async function DashboardPage() {
  const { tasks, goals } = await getDashboardData().catch(() => ({
    tasks: [] as Task[],
    goals: [] as Goal[],
  }))

  const nowTasks = tasks.filter(t => t.tier === 'now')
  const annualGoals = goals.filter(g => g.scope === 'annual')
  const quarterGoals = goals.filter(g => g.scope === 'quarter')

  return (
    <div className="content-inner dash">
      <div className="dash-grid">
        <OperatorCard nowTasks={nowTasks} streakDays={0} />
        <GoalsCard annualGoals={annualGoals} quarterGoals={quarterGoals} />
        <CalendarCard />
        <MacrosCard />
        <HabitsCard />
        <FinanceCard />
      </div>
    </div>
  )
}
