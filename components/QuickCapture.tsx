'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'

const SPACES = ['students', 'southeast', 'family', 'finance', 'journal', 'health', 'resell', 'build']

interface Props {
  onClose: () => void
}

interface AskSource {
  idx: number
  source_type: string
  space_slug: string | null
  created_at: string
  similarity: number
  preview: string
}

interface AskResult {
  query: string
  answer: string
  sources: AskSource[]
}

export default function QuickCapture({ onClose }: Props) {
  const [text, setText] = useState('')
  const [space, setSpace] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [askResult, setAskResult] = useState<AskResult | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const trimmed = text.trim()
  const isAsk = trimmed.startsWith('?')

  async function handleSubmit() {
    if (!trimmed || loading) return
    setLoading(true)

    try {
      if (isAsk) {
        const query = trimmed.replace(/^\?+\s*/, '')
        if (!query) { setLoading(false); return }
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, space }),
        })
        const data = await res.json()
        if (res.ok) setAskResult(data)
        else setToast(data.error ?? 'Ask failed')
      } else {
        const body: Record<string, unknown> = { content: trimmed, type: 'text' }
        if (space) body.space_slug = space
        const res = await fetch('/api/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (data.summary) {
          setToast(data.summary)
          setTimeout(() => { setToast(null); onClose() }, 2200)
        } else {
          onClose()
        }
      }
    } catch {
      setToast('Network error')
      setTimeout(() => setToast(null), 2000)
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
      <div className="modal" onKeyDown={handleKeyDown} style={{ maxWidth: askResult ? 680 : undefined }}>
        <div className="modal-head">
          <span className="h" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAsk ? <><Sparkles size={14} /> Ask my OS</> : 'Quick capture'}
          </span>
          <button className="x" onClick={onClose}><X size={18} /></button>
        </div>

        {!askResult && (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='What&apos;s on your mind? Start with "?" to ask a question…'
          />
        )}

        {askResult && (
          <div style={{ padding: '12px 16px', maxHeight: '50vh', overflowY: 'auto' }}>
            <div style={{
              fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)',
              marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              Q: {askResult.query}
            </div>
            <div style={{
              whiteSpace: 'pre-wrap',
              fontSize: 14,
              lineHeight: 1.55,
              marginBottom: 18,
            }}>
              {askResult.answer}
            </div>

            {askResult.sources.length > 0 && (
              <>
                <div style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)',
                  marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  Sources ({askResult.sources.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {askResult.sources.map(s => (
                    <div
                      key={s.idx}
                      style={{
                        padding: 10,
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        fontSize: 12,
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
                        marginBottom: 4, display: 'flex', justifyContent: 'space-between',
                      }}>
                        <span>[{s.idx}] {s.source_type}{s.space_slug ? ` · ${s.space_slug}` : ''} · {s.created_at.slice(0, 10)}</span>
                        <span>{Math.round(s.similarity * 100)}%</span>
                      </div>
                      <div style={{ color: 'var(--fg)' }}>{s.preview}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="modal-foot">
          {!askResult && (
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
          )}
          <div className="grow" />
          {askResult ? (
            <>
              <button className="btn btn-secondary sm" onClick={() => { setAskResult(null); setText(''); textareaRef.current?.focus() }}>
                Ask another
              </button>
              <button className="btn btn-primary sm" onClick={onClose}>Done</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary sm" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary sm"
                onClick={handleSubmit}
                disabled={loading || !trimmed}
              >
                {loading ? (isAsk ? 'Thinking…' : 'Sending…') : (isAsk ? 'Ask ⌘↵' : 'Capture ⌘↵')}
              </button>
            </>
          )}
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
