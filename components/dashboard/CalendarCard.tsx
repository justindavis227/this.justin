'use client'

import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns'
import { CalendarEvent, CAL_SOURCES } from '@/lib/types'

interface Props {
  events: CalendarEvent[]
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getSourceColor(source: string): string {
  return CAL_SOURCES.find(s => s.id === source)?.color ?? '#9CA3AF'
}

function formatEventTime(e: CalendarEvent): string {
  if (e.is_reminder) return 'Reminder'
  if (e.all_day) return 'All day'
  if (!e.start_at) return ''
  return format(parseISO(e.start_at), 'h:mm a')
}

export default function CalendarCard({ events }: Props) {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [currentMonth, setCurrentMonth] = useState(today)

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const allDays = eachDayOfInterval({ start, end })

    const startPad = start.getDay()
    const prefixDays = Array.from({ length: startPad }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() - startPad + i)
      return d
    })

    return [...prefixDays, ...allDays]
  }, [currentMonth])

  const selectedEvents = useMemo(() => {
    return events
      .filter(e => {
        const d = e.start_at ? parseISO(e.start_at) : null
        if (!d) return false
        return isSameDay(d, selectedDate)
      })
      .sort((a, b) => {
        if (a.is_reminder && !b.is_reminder) return 1
        if (!a.is_reminder && b.is_reminder) return -1
        if (!a.start_at || !b.start_at) return 0
        return parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime()
      })
  }, [events, selectedDate])

  function hasEvents(day: Date): boolean {
    return events.some(e => {
      const d = e.start_at ? parseISO(e.start_at) : null
      return d && isSameDay(d, day)
    })
  }

  const monthLabel = format(currentMonth, 'MMMM yyyy')

  return (
    <div className="dcard cal-card">
      <div className="dcard-head">
        <span className="dcard-eyebrow">{monthLabel}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" style={{ width: 26, height: 26, borderRadius: 6, fontSize: 13 }}
            onClick={() => setCurrentMonth(m => { const d = new Date(m); d.setMonth(d.getMonth() - 1); return d; })}>
            ‹
          </button>
          <button className="icon-btn" style={{ width: 26, height: 26, borderRadius: 6, fontSize: 13 }}
            onClick={() => setCurrentMonth(m => { const d = new Date(m); d.setMonth(d.getMonth() + 1); return d; })}>
            ›
          </button>
        </div>
      </div>

      <div className="cal-mini-grid">
        {WEEKDAYS.map(wd => <div key={wd} className="cmg-wd">{wd}</div>)}
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, currentMonth)
          const tod = isToday(day)
          const sel = isSameDay(day, selectedDate)
          const hasEvt = hasEvents(day)

          return (
            <button
              key={i}
              className={`cmg-cell${!inMonth ? ' out' : ''}${tod ? ' today' : ''}${sel && !tod ? ' sel' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <span className="cmg-num">{day.getDate()}</span>
              <span className={`cmg-dot${hasEvt && inMonth ? ' on' : ''}`} />
            </button>
          )
        })}
      </div>

      <div className="cal-mini-agenda">
        <div className="cma-head">
          {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
        </div>
        {selectedEvents.length === 0 ? (
          <div className="cma-empty">No events</div>
        ) : (
          <div className="cal-mini-list">
            {selectedEvents.slice(0, 5).map((e) => (
              <div key={e.id} className="cme">
                {e.is_reminder ? (
                  <span className="cme-rem" style={{ borderColor: getSourceColor(e.source) }} />
                ) : (
                  <span className="cme-bar" style={{ background: getSourceColor(e.source) }} />
                )}
                <span className="cme-time">{formatEventTime(e)}</span>
                <span className="cme-title">{e.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
