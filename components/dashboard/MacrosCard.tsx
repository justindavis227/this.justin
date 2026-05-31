'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Entry {
  id: string
  description: string
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  llm_source: string | null
  created_at: string
}

interface MacrosPayload {
  date: string
  entries: Entry[]
  totals: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
}

const GOALS = { cal: 2200, protein: 180, carbs: 220, fat: 70 }

export default function MacrosCard() {
  const [data, setData] = useState<MacrosPayload | null>(null)
  const [adding, setAdding] = useState(false)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/macros/today', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } catch { /* ignore */ }
  }

  useEffect(() => { load() }, [])

  async function submit() {
    const desc = input.trim()
    if (!desc || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc }),
      })
      if (res.ok) {
        setInput('')
        setAdding(false)
        await load()
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/macros?id=${id}`, { method: 'DELETE' })
    load()
  }

  const totals = data?.totals ?? { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  const rows = [
    { label: 'Calories', val: totals.calories,  goal: GOALS.cal,     unit: 'kcal', color: '#EF4444' },
    { label: 'Protein',  val: totals.protein_g, goal: GOALS.protein, unit: 'g',    color: '#3B82F6' },
    { label: 'Carbs',    val: totals.carbs_g,   goal: GOALS.carbs,   unit: 'g',    color: '#FBBF24' },
    { label: 'Fat',      val: totals.fat_g,     goal: GOALS.fat,     unit: 'g',    color: '#10B981' },
  ]

  return (
    <div className="dcard" style={{ gridArea: 'macros' }}>
      <div className="dcard-head">
        <span className="dcard-eyebrow">Macros · Today</span>
        <button
          className="btn btn-secondary sm"
          onClick={() => setAdding(v => !v)}
          style={{ fontSize: 11, padding: '4px 10px' }}
        >
          <Plus size={12} /> Log meal
        </button>
      </div>

      {adding && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 6 }}>
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="e.g. 2 eggs, toast, oat milk latte"
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 6,
              padding: '6px 10px',
              color: 'inherit',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button className="btn btn-primary sm" onClick={submit} disabled={submitting || !input.trim()}>
            {submitting ? '…' : 'Log'}
          </button>
        </div>
      )}

      <div className="macro-quad">
        {rows.map(({ label, val, goal, unit, color }) => {
          const pct = goal > 0 ? Math.min(100, Math.round((val / goal) * 100)) : 0
          return (
            <div key={label} className="mq-cell">
              <div className="mq-top">
                <span className="mq-label">{label}</span>
                <span className="mq-pct">{pct}%</span>
              </div>
              <div className="mq-val">{val} <span className="mq-g">/ {goal}{unit}</span></div>
              <div className="track sm">
                <span style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          )
        })}
      </div>

      {data && data.entries.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
            ENTRIES ({data.entries.length})
          </div>
          {data.entries.map(e => (
            <div
              key={e.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 0',
                fontSize: 12,
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.description}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 11 }}>
                {e.calories ?? '—'}c · {e.protein_g ?? '—'}p
              </span>
              <button
                onClick={() => remove(e.id)}
                aria-label="Delete entry"
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {data && data.entries.length === 0 && (
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          No entries today. Tap “Log meal” or capture by voice.
        </div>
      )}
    </div>
  )
}
