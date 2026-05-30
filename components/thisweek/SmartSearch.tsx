'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Task } from '@/lib/types'

const EXAMPLES = [
  'what should I do this morning',
  'anything blocked?',
  'quick wins under an hour',
  'everything for family',
]

function Chip({ status }: { status: string }) {
  return (
    <span className={`chip ${status}`}>
      <span className="dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function SmartSearch({ tasks }: { tasks: Task[] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Task[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [focused, setFocused] = useState(false)

  async function run(q?: string) {
    const text = (q ?? query).trim()
    if (!text) return
    setQuery(text)
    setLoading(true)
    setNote('')

    try {
      const res = await fetch('/api/tasks/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      })
      const data = await res.json()
      const ids: string[] = data.ids ?? []
      const matched = ids.map(id => tasks.find(t => t.id === id)).filter(Boolean) as Task[]
      setResults(matched)
      setNote(data.note ?? `${matched.length} task${matched.length !== 1 ? 's' : ''} matched.`)
    } catch {
      const q2 = text.toLowerCase()
      const matched = tasks.filter(t =>
        t.title.toLowerCase().includes(q2) ||
        (t.space_slug ?? '').includes(q2) ||
        (q2.includes('now') && t.tier === 'now') ||
        (q2.includes('block') && (t.tags ?? []).includes('blocked'))
      )
      setResults(matched)
      setNote(`Offline match — ${matched.length} result${matched.length !== 1 ? 's' : ''}.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className={`smart-input${focused ? ' focus' : ''}`}>
        <Sparkles size={18} />
        <input
          value={query}
          placeholder='Ask in plain words — "what should I do this morning?"'
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') run() }}
        />
        <button className="btn btn-primary sm" onClick={() => run()} disabled={loading}>
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </div>

      <div className="smart-chips">
        {EXAMPLES.map((ex) => (
          <button key={ex} className="smart-chip" onClick={() => run(ex)}>{ex}</button>
        ))}
      </div>

      {results !== null && (
        <>
          <div className="smart-note">{note}</div>
          <div className="cat-list">
            {results.length === 0
              ? <div className="empty">Nothing matched. Try another phrasing.</div>
              : results.map((t) => (
                <div key={t.id} className="tcard" style={{ cursor: 'default' }}>
                  <div className="tt">{t.title}</div>
                  <div className="tmeta">
                    {t.space_slug && <span className="tspace">{t.space_slug}</span>}
                    {t.due_date && <span className="tdue">{t.due_date}</span>}
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}
    </div>
  )
}
