import { format, startOfWeek, addDays } from 'date-fns'

export interface HabitDef {
  slug: string
  label: string
  cadence: string
  target_per_week: number | null
  active: boolean
  sort_order: number
}

export function fmtDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function calcStreak(
  cadence: string,
  target_per_week: number | null,
  logs: Set<string>,
  today: Date = new Date()
): number {
  if (cadence === 'daily') {
    let streak = 0
    let d = new Date(today)
    if (!logs.has(fmtDate(d))) d = addDays(d, -1)
    while (logs.has(fmtDate(d))) {
      streak++
      d = addDays(d, -1)
    }
    return streak
  }

  const target = target_per_week ?? 1
  let streak = 0
  let weekStart = startOfWeek(today, { weekStartsOn: 1 })

  const weekCount = (ws: Date) => {
    let c = 0
    for (let i = 0; i < 7; i++) if (logs.has(fmtDate(addDays(ws, i)))) c++
    return c
  }

  const currentCount = weekCount(weekStart)
  if (currentCount >= target) streak++
  weekStart = addDays(weekStart, -7)

  while (weekCount(weekStart) >= target) {
    streak++
    weekStart = addDays(weekStart, -7)
  }

  return streak
}
