'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import QuickCapture from './QuickCapture'

const VIEW_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard':          { title: 'Dashboard',  sub: 'Good to have you back.' },
  '/this-week':          { title: 'This Week',  sub: 'Kanban · Smart · Category' },
  '/calendar':           { title: 'Calendar',   sub: 'All sources' },
  '/projects':           { title: 'Projects',   sub: '' },
  '/settings':           { title: 'Settings',   sub: '' },
  '/spaces/southeast':   { title: 'Southeast',  sub: 'Church planting' },
  '/spaces/students':    { title: 'Students',   sub: 'Student ministry' },
  '/spaces/family':      { title: 'Family',     sub: 'Shared with Elizabeth' },
  '/spaces/finance':     { title: 'Finance',    sub: 'Net worth · Budget' },
  '/spaces/journal':     { title: 'Journal',    sub: 'Reflection + notes' },
  '/spaces/health':      { title: 'Health',     sub: 'Habits · Macros' },
  '/spaces/sourcing':    { title: 'Sourcing',   sub: 'Buying pipeline' },
  '/spaces/listings':    { title: 'Listings',   sub: 'What\'s live' },
  '/spaces/experiments': { title: 'Experiments',sub: 'Sketches + prototypes' },
  '/spaces/brandkit':    { title: 'Brand kit',  sub: 'Design system' },
}

export default function Topbar() {
  const pathname = usePathname()
  const [captureOpen, setCaptureOpen] = useState(false)

  const { title, sub } = VIEW_TITLES[pathname] ?? { title: 'This✱Justin', sub: '' }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCaptureOpen(true)
    }
    if (e.key === 'Escape') {
      setCaptureOpen(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      <div className="topbar-edge" />
      <header className="topbar">
        <div>
          <div className="tb-title">{title}</div>
          {sub && <div className="tb-sub">{sub}</div>}
        </div>
        <div className="tb-actions">
          <button className="cmd-trigger" onClick={() => setCaptureOpen(true)}>
            <Search size={15} />
            <span>Capture or search…</span>
            <span className="kbd">⌘K</span>
          </button>
          <button className="btn btn-primary" onClick={() => setCaptureOpen(true)}>
            <Plus size={16} /> Capture
          </button>
        </div>
      </header>

      {captureOpen && <QuickCapture onClose={() => setCaptureOpen(false)} />}
    </>
  )
}
