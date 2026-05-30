import { Check } from 'lucide-react'
import { format, startOfWeek, addDays } from 'date-fns'

const HABITS = [
  { id: 'h1', name: 'Read scripture' },
  { id: 'h2', name: 'Train / workout' },
  { id: 'h3', name: 'No sugar' },
  { id: 'h4', name: 'Sleep by 11' },
]

export default function HabitsCard() {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayStr = format(today, 'yyyy-MM-dd')

  return (
    <div className="dcard habits-card">
      <div className="dcard-head">
        <span className="dcard-eyebrow">Habits · This week</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>Phase 2</span>
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

        {HABITS.map((h) => (
          <div key={h.id} className="hg-row">
            <div className="hg-name">
              <span>{h.name}</span>
            </div>
            {weekDays.map((d) => {
              const dStr = format(d, 'yyyy-MM-dd')
              const isToday = dStr === todayStr
              const isFuture = d > today
              return (
                <div key={d.toISOString()} className="hg-cell">
                  <div className={`hg-check${isFuture ? ' future' : ''}`}>
                    {!isFuture && !isToday && <Check size={13} strokeWidth={2.5} />}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        Full habit tracking + streaks in Phase 2.
      </div>
    </div>
  )
}
