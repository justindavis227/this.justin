'use client'

import { useRouter } from 'next/navigation'
import { LayoutGrid, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="content-inner">
      <div className="section">
        <div className="section-head">
          <span className="section-eyebrow">Settings</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
          <button
            onClick={() => router.push('/settings/spaces')}
            className="dcard"
            style={{
              padding: 16, textAlign: 'left', cursor: 'pointer',
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

          <div className="dcard" style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Session</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              Signed in as Justin Davis · justindavis227@gmail.com
            </div>
            <button className="btn btn-secondary sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  )
}
