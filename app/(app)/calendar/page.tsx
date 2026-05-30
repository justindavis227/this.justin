import { supabaseAdmin } from '@/lib/supabase'
import { CalendarEvent } from '@/lib/types'
import CalendarView from '@/components/calendar/CalendarView'
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'

export const revalidate = 60

async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const db = supabaseAdmin()
  const now = new Date()
  const from = startOfMonth(subMonths(now, 1))
  const to = endOfMonth(addMonths(now, 2))

  const { data } = await db
    .from('calendar_events')
    .select('*')
    .gte('start_at', from.toISOString())
    .lte('start_at', to.toISOString())
    .order('start_at')

  return (data ?? []) as CalendarEvent[]
}

export default async function CalendarPage() {
  const events = await getCalendarEvents().catch(() => [] as CalendarEvent[])
  return <CalendarView events={events} />
}
