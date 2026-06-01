// Server component — fetches /api/spaces with the API_SECRET Bearer so it
// shares whatever execution context the working API route has. This avoids
// the previous direct supabaseAdmin() call (which was failing silently for
// reasons we couldn't pin down) and routes through the demonstrably-working
// /api/spaces endpoint instead. Falls back to a hardcoded array on any
// failure path so navigation is always reachable.

import { headers } from 'next/headers'
import SidebarClient, { DbSpace } from './SidebarClient'

const HARDCODED_FALLBACK_SPACES: DbSpace[] = [
  { slug: 'work',      label: 'Work',      icon: 'Briefcase',     parent_slug: null,       sort_order: 1, hidden: false, attn: false },
  { slug: 'southeast', label: 'Southeast', icon: 'MapPin',        parent_slug: 'work',     sort_order: 1, hidden: false, attn: false },
  { slug: 'students',  label: 'Students',  icon: 'GraduationCap', parent_slug: 'work',     sort_order: 2, hidden: false, attn: true  },
  { slug: 'personal',  label: 'Personal',  icon: 'User',          parent_slug: null,       sort_order: 2, hidden: false, attn: false },
  { slug: 'family',    label: 'Family',    icon: 'Users',         parent_slug: 'personal', sort_order: 1, hidden: false, attn: false },
  { slug: 'finance',   label: 'Finance',   icon: 'Wallet',        parent_slug: 'personal', sort_order: 2, hidden: false, attn: false },
  { slug: 'journal',   label: 'Journal',   icon: 'BookOpen',      parent_slug: 'personal', sort_order: 3, hidden: false, attn: false },
  { slug: 'health',    label: 'Health',    icon: 'Heart',         parent_slug: 'personal', sort_order: 4, hidden: false, attn: false },
  { slug: 'resell',    label: 'Resell',    icon: 'Tags',          parent_slug: null,       sort_order: 3, hidden: false, attn: false },
  { slug: 'listings',  label: 'Listings',  icon: 'Tag',           parent_slug: 'resell',   sort_order: 1, hidden: false, attn: false },
  { slug: 'build',     label: 'Build',     icon: 'Hammer',        parent_slug: null,       sort_order: 4, hidden: false, attn: false },
]

async function loadSpaces(): Promise<DbSpace[]> {
  try {
    const hdrs = await headers()
    const host = hdrs.get('host')
    const proto = hdrs.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
    const apiSecret = process.env.API_SECRET

    if (!host) {
      console.error('[Sidebar] no host header — using fallback')
      return HARDCODED_FALLBACK_SPACES
    }
    if (!apiSecret) {
      console.error('[Sidebar] API_SECRET not set — cannot authenticate internal call to /api/spaces; using fallback')
      return HARDCODED_FALLBACK_SPACES
    }

    const url = `${proto}://${host}/api/spaces`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiSecret}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[Sidebar] /api/spaces returned ${res.status} ${res.statusText}: ${body.slice(0, 200)}`)
      return HARDCODED_FALLBACK_SPACES
    }

    const data = await res.json()
    const spaces = (data.spaces ?? []) as DbSpace[]

    if (spaces.length === 0) {
      console.error('[Sidebar] /api/spaces returned empty array — using fallback')
      return HARDCODED_FALLBACK_SPACES
    }

    return spaces
  } catch (e) {
    console.error('[Sidebar] threw while loading spaces:', e instanceof Error ? e.message : e)
    return HARDCODED_FALLBACK_SPACES
  }
}

export default async function Sidebar() {
  const spaces = await loadSpaces()
  return <SidebarClient spaces={spaces} />
}
