'use client'

import { useRouter } from 'next/navigation'

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
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 20, maxWidth: 480 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Session</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Signed in as Justin Davis · justindavis227@gmail.com</div>
          <button className="btn btn-secondary sm" onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
