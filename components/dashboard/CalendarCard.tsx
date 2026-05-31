'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, parseISO, subDays, addDays,
} from 'date-fns'
import { CalendarEvent, CAL_SOURCES } from '@/lib/types'

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

export default function CalendarCard() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [currentMonth, setCurrentMonth] = useState(today)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch a window covering the grid: month ± 1 week so prefix/suffix days are populated.
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const from = subDays(startOfMonth(currentMonth), 7).toISOString()
      const to = addDays(endOfMonth(currentMonth), 7).toISOString()
      try {
        const res = await fetch(`/api/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) setEvents((data.events ?? []) as CalendarEvent[])
      } catch {
        if (!cancelled) setEvents([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [currentMonth])

  // Dedup events that appear on multiple sources (e.g. work + iCloud copy).
  // Key by title + local start date; prefer work_personal, then work_students,
  // then apple_personal, apple_family, reminders.
  const dedupedEvents = useMemo(() => {
    const sourcePriority: Record<string, number> = {
      work_personal:  0,
      work_students:  1,
      apple_personal: 2,
      apple_family:   3,
      reminders:      4,
    }
    const byKey = new Map<string, CalendarEvent>()
    const noKey: CalendarEvent[] = []
    for (const e of events) {
      if (!e.start_at) { noKey.push(e); continue }
      const d = parseISO(e.start_at)
      const key = `${e.title.trim().toLowerCase()}|${format(d, 'yyyy-MM-dd')}`
      const existing = byKey.get(key)
      if (!existing) {
        byKey.set(key, e)
      } else {
        const newP = sourcePriority[e.source] ?? 99
        const oldP = sourcePriority[existing.source] ?? 99
        if (newP < oldP) byKey.set(key, e)
      }
    }
    return [...byKey.values(), ...noKey]
  }, [events])

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
    return dedupedEvents
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
  }, [dedupedEvents, selectedDate])

  function hasEvents(day: Date): boolean {
    return dedupedEvents.some(e => {
      const d = e.start_at ? parseISO(e.start_at) : null
      return d && isSameDay(d, day)
    })
  }

  const monthLabel = format(currentMonth, 'MMMM yyyy')

  return (
    <div className="dcard cal-card">
      <div className="dcard-head">
        <span className="dcard-eyebrow">{monthLabel}{loading ? ' · …' : ''}</span>
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
          <div className="cma-empty">{loading ? 'Loading…' : 'No events'}</div>
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
