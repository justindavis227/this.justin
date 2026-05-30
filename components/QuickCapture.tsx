'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

const SPACES = ['students', 'southeast', 'family', 'finance', 'journal', 'health', 'resell', 'build']

interface Props {
  onClose: () => void
}

export default function QuickCapture({ onClose }: Props) {
  const [text, setText] = useState('')
  const [space, setSpace] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  async function handleSubmit() {
    if (!text.trim() || loading) return
    setLoading(true)

    try {
      const body: Record<string, unknown> = { text: text.trim() }
      if (space) body.space_slug = space

      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (data.summary) {
        setToast(data.summary)
        setTimeout(() => {
          setToast(null)
          onClose()
        }, 2200)
      } else {
        onClose()
      }
    } catch {
      onClose()
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" onKeyDown={handleKeyDown}>
        <div className="modal-head">
          <span className="h">Quick capture</span>
          <button className="x" onClick={onClose}><X size={18} /></button>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? Task, note, idea, or reminder…"
        />
        <div className="modal-foot">
          <div className="ws-pick">
            {SPACES.map((s) => (
              <button
                key={s}
                className={`ws-tag${space === s ? ' on' : ''}`}
                onClick={() => setSpace(space === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="grow" />
          <button className="btn btn-secondary sm" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary sm"
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Sending…' : 'Capture ⌘↵'}
          </button>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <span className="ok">✓</span> {toast}
        </div>
      )}
    </div>
  )
}
