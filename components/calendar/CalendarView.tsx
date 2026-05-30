'use client'

import { useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { CalendarEvent, CAL_SOURCES } from '@/lib/types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getSourceColor(source: string): string {
  return CAL_SOURCES.find(s => s.id === source)?.color ?? '#9CA3AF'
}

interface Props {
  events: CalendarEvent[]
}

export default function CalendarView({ events }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [enabledSources, setEnabledSources] = useState<Set<string>>(
    () => new Set(CAL_SOURCES.filter(s => s.enabled).map(s => s.id))
  )

  const filteredEvents = useMemo(
    () => events.filter(e => enabledSources.has(e.source)),
    [events, enabledSources]
  )

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
    const totalCells = Math.ceil((startPad + allDays.length) / 7) * 7
    const suffixCount = totalCells - prefixDays.length - allDays.length
    const suffixDays = Array.from({ length: suffixCount }, (_, i) => {
      const d = new Date(end)
      d.setDate(d.getDate() + i + 1)
      return d
    })
    return [...prefixDays, ...allDays, ...suffixDays]
  }, [currentMonth])

  function eventsForDay(day: Date): CalendarEvent[] {
    return filteredEvents.filter(e => {
      const d = e.start_at ? parseISO(e.start_at) : null
      return d && isSameDay(d, day)
    })
  }

  const selectedEvents = useMemo(() =>
    eventsForDay(selectedDate).sort((a, b) => {
      if (a.is_reminder && !b.is_reminder) return 1
      if (!a.is_reminder && b.is_reminder) return -1
      if (!a.start_at || !b.start_at) return 0
      return parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime()
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredEvents, selectedDate]
  )

  function toggleSource(id: string) {
    setEnabledSources(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="content-inner cal-wrap">
      <div className="cal-toolbar">
        <div className="cal-month">{format(currentMonth, 'MMMM yyyy')}</div>
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
            <ChevronLeft size={16} />
          </button>
          <button className="btn btn-secondary sm" onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()) }}>
            Today
          </button>
          <button className="icon-btn" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="cal-legend">
        {CAL_SOURCES.map((src) => (
          <button
            key={src.id}
            className={`src-toggle${!enabledSources.has(src.id) ? ' off' : ''}`}
            onClick={() => toggleSource(src.id)}
          >
            <span className="src-dot" style={{ background: src.color }} />
            {src.label}
          </button>
        ))}
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map(wd => <div key={wd} className="cal-wd">{wd.toUpperCase()}</div>)}
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, currentMonth)
          const tod = isToday(day)
          const sel = isSameDay(day, selectedDate)
          const dayEvents = eventsForDay(day)

          return (
            <button
              key={i}
              className={`cal-cell${!inMonth ? ' out' : ''}${sel ? ' sel' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <span className={`cal-dnum${tod ? ' today' : ''}`}>{day.getDate()}</span>
              <div className="cal-dots">
                {dayEvents.slice(0, 4).map((e) => (
                  <span
                    key={e.id}
                    className="cal-dot"
                    style={{ background: getSourceColor(e.source) }}
                  />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {selectedEvents.length > 0 && (
        <div className="cal-agenda">
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMMM d')}
          </div>

          {selectedEvents.map((e) => (
            <div key={e.id} className="ag-row">
              <div className="ag-time">
                {e.is_reminder || e.all_day ? (
                  <span className="allday">{e.is_reminder ? 'Reminder' : 'All day'}</span>
                ) : (
                  <>
                    <span>{e.start_at ? format(parseISO(e.start_at), 'h:mm a') : ''}</span>
                    {e.end_at && <span className="ag-end">{format(parseISO(e.end_at), 'h:mm a')}</span>}
                  </>
                )}
              </div>
              <div className="ag-bar" style={{ background: getSourceColor(e.source) }} />
              <div className="ag-body">
                <div className="ag-title">{e.title}</div>
                <div className="ag-meta">
                  <span className="ag-src">{e.source.replace('_', ' ')}</span>
                  {e.location && (
                    <span className="ag-loc"><MapPin size={12} />{e.location}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvents.length === 0 && (
        <div style={{ marginTop: 24, fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          No events on {isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}.
        </div>
      )}
    </div>
  )
}
