'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'

export interface TabDef { id: string; label: string }

interface Props {
  name: string
  tabs: TabDef[]
  activeTab: string
  tagline: string
  syncLabel?: string
  children: React.ReactNode
  mockBanner?: string
}

export default function SpaceShell({
  name, tabs, activeTab, tagline, syncLabel, children, mockBanner,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const today = new Date()

  function setTab(tabId: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (tabId === tabs[0]?.id) p.delete('tab')
    else p.set('tab', tabId)
    p.delete('sub') // reset sub-tabs when parent tab changes
    const qs = p.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }

  return (
    <div className="content-inner">
      {/* Header: name + date + status */}
      <div className="section" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
            <span>{format(today, 'EEE, MMM d · yyyy')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: '#10B981' }} />
              all systems nominal
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: 2,
        marginBottom: 12,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 1,
      }}>
        {tabs.map(t => {
          const active = t.id === activeTab
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: 'none',
                border: 'none',
                color: active ? 'var(--fg)' : 'var(--muted)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: active ? '2px solid var(--fg)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 120ms',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tagline + sync badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>{tagline}</span>
        {syncLabel && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--muted)',
            padding: '3px 8px',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            Synced from {syncLabel}
          </span>
        )}
      </div>

      {mockBanner && (
        <div style={{
          marginBottom: 14,
          padding: '8px 12px',
          borderRadius: 6,
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.20)',
          color: '#93C5FD',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
        }}>
          {mockBanner}
        </div>
      )}

      {children}
    </div>
  )
}
