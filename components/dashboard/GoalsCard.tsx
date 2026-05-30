'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { Goal } from '@/lib/types'

interface Props {
  annualGoals: Goal[]
  quarterGoals: Goal[]
}

export default function GoalsCard({ annualGoals, quarterGoals }: Props) {
  const [scope, setScope] = useState<'annual' | 'quarter'>('annual')
  const [goals, setGoals] = useState({ annual: annualGoals, quarter: quarterGoals })

  const current = goals[scope]
  const open = current.filter(g => !g.done)
  const done = current.filter(g => g.done)

  async function toggleGoal(id: string) {
    const goal = current.find(g => g.id === id)
    if (!goal) return

    const res = await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !goal.done }),
    })

    if (res.ok) {
      setGoals(prev => ({
        ...prev,
        [scope]: prev[scope].map(g => g.id === id ? { ...g, done: !g.done } : g),
      }))
    }
  }

  return (
    <div className="dcard goals-card">
      <div className="dcard-head">
        <span className="dcard-eyebrow">Goals</span>
        <div className="mini-seg">
          <button className={scope === 'annual' ? 'on' : ''} onClick={() => setScope('annual')}>Annual</button>
          <button className={scope === 'quarter' ? 'on' : ''} onClick={() => setScope('quarter')}>Quarter</button>
        </div>
      </div>

      <div className="goals-sub">
        {open.length} open · {done.length} done
      </div>

      <div className="goal-list2">
        {current.map((g) => (
          <div key={g.id} className={`goal-row2${g.done ? ' done' : ''}`}>
            <button className="goal-check" onClick={() => toggleGoal(g.id)}>
              {g.done && <Check size={12} strokeWidth={2.5} />}
            </button>
            <div className="goal-text2">{g.text}</div>
          </div>
        ))}
        {current.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0' }}>
            No {scope} goals yet. Add one below.
          </div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <button className="ghost-add">
          <Plus size={13} /> Add goal
        </button>
      </div>
    </div>
  )
}
