'use client'

import { useEffect, useState } from 'react'
import { Check, Flame } from 'lucide-react'
import { format, startOfWeek, addDays, subDays } from 'date-fns'

interface HabitRow {
  slug: string
  label: string
  cadence: string
  target_per_week: number | null
  week: Record<string, boolean>
  streak: number
}

interface HabitsPayload {
  habits: HabitRow[]
  heatmap: Record<string, number>
}

export default function HabitsCard() {
  const [data, setData] = useState<HabitsPayload | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  async function load() {
    try {
      const res = await fetch('/api/habits', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } catch { /* ignore */ }
  }

  useEffect(() => { load() }, [])

  async function toggle(slug: string, dateStr: string, current: boolean) {
    if (pending) return
    setPending(`${slug}:${dateStr}`)
    setData(prev => {
      if (!prev) return prev
      const habits = prev.habits.map(h =>
        h.slug === slug ? { ...h, week: { ...h.week, [dateStr]: !current } } : h
      )
      return { ...prev, habits }
    })
    try {
      const res = await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, date: dateStr, done: !current }),
      })
      if (!res.ok) await load()
      else load()
    } catch {
      await load()
    } finally {
      setPending(null)
    }
  }

  const heatmapDays = Array.from({ length: 30 }, (_, i) => format(addDays(subDays(today, 29), i), 'yyyy-MM-dd'))

  function heatColor(pct: number): string {
    if (pct <= 0) return 'rgba(255,255,255,0.04)'
    if (pct < 0.34) return 'rgba(16,185,129,0.20)'
    if (pct < 0.67) return 'rgba(16,185,129,0.45)'
    if (pct < 1.0)  return 'rgba(16,185,129,0.70)'
    return 'rgba(16,185,129,0.95)'
  }

  return (
    <div className="dcard habits-card">
      <div className="dcard-head">
        <span className="dcard-eyebrow">Habits · This week</span>
        {data && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
            {data.habits.length} active
          </span>
        )}
      </div>

      <div className="habit-grid">
        <div className="hg-row hg-head">
          <div />
          {weekDays.map((d) => {
            const isToday = format(d, 'yyyy-MM-dd') === todayStr
            return (
              <div key={d.toISOString()} className={`hg-day${isToday ? ' today' : ''}`}>
                <span>{format(d, 'EEE').toUpperCase()}</span>
                <span className="hg-dnum">{format(d, 'd')}</span>
              </div>
            )
          })}
        </div>

        {data?.habits.map((h) => (
          <div key={h.slug} className="hg-row">
            <div className="hg-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{h.label}</span>
              {h.streak > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FBBF24'
                }}>
                  <Flame size={10} />{h.streak}
                </span>
              )}
            </div>
            {weekDays.map((d) => {
              const dStr = format(d, 'yyyy-MM-dd')
              const isToday = dStr === todayStr
              const isFuture = d > today
              const done = h.week[dStr] ?? false
              const key = `${h.slug}:${dStr}`
              const busy = pending === key
              const cellClass = `hg-check${isFuture ? ' future' : ''}${done ? ' done' : ''}${busy ? ' busy' : ''}`
              return (
                <div
                  key={d.toISOString()}
                  className="hg-cell"
                  onClick={() => !isFuture && toggle(h.slug, dStr, done)}
                  style={{ cursor: isFuture ? 'default' : 'pointer' }}
                  role={isFuture ? undefined : 'button'}
                  aria-label={`${h.label} ${dStr}${done ? ' (done)' : ''}`}
                >
                  <div
                    className={cellClass}
                    style={{
                      background: done ? '#10B981' : undefined,
                      borderColor: done ? '#10B981' : undefined,
                      opacity: busy ? 0.5 : 1,
                    }}
                  >
                    {done && <Check size={13} strokeWidth={2.8} color="#0a0a0a" />}
                    {!done && isToday && <span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--muted)' }} />}
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {!data && (
          <div className="hg-row">
            <div className="hg-name" style={{ color: 'var(--muted)', fontSize: 12 }}>Loading…</div>
          </div>
        )}
      </div>

      {data && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>
            LAST 30 DAYS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: 3 }}>
            {heatmapDays.map(d => (
              <div
                key={d}
                title={`${d} · ${Math.round((data.heatmap[d] ?? 0) * 100)}%`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 2,
                  background: heatColor(data.heatmap[d] ?? 0),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
