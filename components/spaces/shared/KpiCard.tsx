import React from 'react'

interface Props {
  label: string
  value: string
  subtitle?: string
  accent?: string
}

export default function KpiCard({ label, value, subtitle, accent }: Props) {
  return (
    <div className="dcard" style={{ padding: 14, minHeight: 88 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        color: accent ?? 'var(--muted)',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.05 }}>{value}</div>
      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
