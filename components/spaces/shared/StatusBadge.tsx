import React from 'react'

export type SpaceStatus =
  | 'active'
  | 'attention'
  | 'complete'
  | 'idle'
  | 'idea'
  | 'research'
  | 'conflict'

const PILL_STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  active:    { bg: 'rgba(59,130,246,0.18)', fg: '#93C5FD', label: 'Active' },
  attention: { bg: 'rgba(251,191,36,0.18)', fg: '#FBBF24', label: 'Attention' },
  complete:  { bg: 'rgba(16,185,129,0.18)', fg: '#6EE7B7', label: 'Complete' },
  conflict:  { bg: 'rgba(239,68,68,0.18)',  fg: '#FCA5A5', label: 'Conflict' },
}

const DOT_STATUS: Record<string, { label: string }> = {
  idle:     { label: 'Idle' },
  idea:     { label: 'Idea' },
  research: { label: 'Research' },
}

export default function StatusBadge({ status }: { status: SpaceStatus }) {
  if (status in PILL_STATUS) {
    const { bg, fg, label } = PILL_STATUS[status]
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        background: bg,
        color: fg,
      }}>{label}</span>
    )
  }
  const dot = DOT_STATUS[status]
  if (!dot) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--muted)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--muted)' }} />
      {dot.label}
    </span>
  )
}
