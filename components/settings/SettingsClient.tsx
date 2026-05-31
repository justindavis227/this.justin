'use client'

import { useRouter } from 'next/navigation'
import { LayoutGrid, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface ActivityRow {
  id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// Map action → terminal prefix symbol + color
function symbolFor(row: ActivityRow): { symbol: string; color: string } {
  const a = row.action.toLowerCase()
  if (a.includes('complete') || a.includes('done')) return { symbol: '✓', color: '#6EE7B7' }
  if (a.includes('attn') || a.includes('attention') || a.includes('flag')) return { symbol: '△', color: '#FBBF24' }
  if (a.includes('conflict') || a.includes('error') || a.includes('fail')) return { symbol: '✗', color: '#FCA5A5' }
  if (a === 'capture' || a.includes('route') || a.includes('sync')) return { symbol: '→', color: '#93C5FD' }
  return { symbol: ' ', color: '#9CA3AF' }
}

function describe(row: ActivityRow): string {
  const meta = row.metadata ?? {}
  if (row.action === 'capture') {
    const kind = (meta.kind as string) ?? 'note'
    const source = (meta.source as string) ?? 'unknown'
    return `captured ${kind} via ${source} → ${row.resource_type ?? ''}`
  }
  return `${row.action}${row.resource_type ? ` · ${row.resource_type}` : ''}`
}

export default function SettingsClient({ activity }: { activity: ActivityRow[] }) {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="content-inner">
      <div className="section" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Settings</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
          System preferences + recent activity.
        </p>
      </div>

      {/* PREFERENCES */}
      <div className="section" style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
          letterSpacing: 0.6, color: 'var(--muted)', marginBottom: 10,
        }}>Preferences</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
          <button
            onClick={() => router.push('/settings/spaces')}
            className="dcard"
            style={{
              padding: 14, textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.10)',
              color: 'inherit',
            }}
          >
            <LayoutGrid size={18} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Spaces</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Add, rename, reorder, or hide spaces in the sidebar</div>
            </div>
            <ChevronRight size={16} />
          </button>

          <div className="dcard" style={{ padding: 14, opacity: 0.7 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>System preferences</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Settings — system preferences live here.</div>
          </div>

          <div className="dcard" style={{ padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Session</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
              Signed in as Justin Davis · justindavis227@gmail.com
            </div>
            <button className="btn btn-secondary sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>

      {/* ACTIVITY LOG */}
      <div className="section">
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
          letterSpacing: 0.6, color: 'var(--muted)', marginBottom: 10,
        }}>Activity log</div>

        <div style={{
          background: '#08090a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: 16,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.7,
          color: '#9CA3AF',
          maxHeight: 480,
          overflowY: 'auto',
        }}>
          {activity.length === 0 ? (
            <div>No activity yet. Capture something and it’ll show up here.</div>
          ) : activity.map(row => {
            const { symbol, color } = symbolFor(row)
            const ts = format(parseISO(row.created_at), 'MMM d HH:mm:ss')
            return (
              <div key={row.id} style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#4B5563', minWidth: 96 }}>{ts}</span>
                <span style={{ color, minWidth: 14, textAlign: 'center', fontWeight: 700 }}>{symbol}</span>
                <span style={{ flex: 1 }}>{describe(row)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
