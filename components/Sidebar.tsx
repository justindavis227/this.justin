'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CalendarRange, FolderKanban,
  Briefcase, MapPin, GraduationCap, User, Users, Wallet, BookOpen, Heart,
  Tags, Search, Tag, Hammer, FlaskConical, Palette, Box,
  Settings, ChevronsLeft, ChevronDown, ChevronRight,
} from 'lucide-react'
import { getIcon } from '@/lib/icons'

interface DbSpace {
  slug: string
  label: string
  icon: string | null
  nav_group: string | null
  sort_order: number
  hidden: boolean
  attn: boolean
}

// Hardcoded fallback — used if the API fails OR returns no spaces.
// Mirrors the legacy sidebar exactly so navigation always works.
const HARDCODED_NAV = [
  {
    group: 'Home', items: [
      { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard,  href: '/dashboard' },
      { id: 'this-week',  label: 'This Week',  icon: CalendarRange,    href: '/this-week' },
      { id: 'projects',   label: 'Projects',   icon: FolderKanban,     href: '/projects' },
    ],
  },
  {
    group: 'Spaces', items: [
      { id: 'work', label: 'Work', icon: Briefcase, children: [
        { id: 'southeast', label: 'Southeast', icon: MapPin,          href: '/spaces/southeast' },
        { id: 'students',  label: 'Students',  icon: GraduationCap,   href: '/spaces/students', attn: true },
      ]},
      { id: 'personal', label: 'Personal', icon: User, children: [
        { id: 'family',  label: 'Family',  icon: Users,    href: '/spaces/family' },
        { id: 'finance', label: 'Finance', icon: Wallet,   href: '/spaces/finance' },
        { id: 'journal', label: 'Journal', icon: BookOpen, href: '/spaces/journal' },
        { id: 'health',  label: 'Health',  icon: Heart,    href: '/spaces/health' },
      ]},
      { id: 'resell', label: 'Resell', icon: Tags, children: [
        { id: 'sourcing',  label: 'Sourcing',  icon: Search, href: '/spaces/sourcing' },
        { id: 'listings',  label: 'Listings',  icon: Tag,    href: '/spaces/listings' },
      ]},
      { id: 'build', label: 'Build', icon: Hammer, children: [
        { id: 'experiments', label: 'Experiments', icon: FlaskConical, href: '/spaces/experiments' },
        { id: 'brandkit',    label: 'Brand kit',   icon: Palette,      href: '/spaces/brandkit' },
      ]},
    ],
  },
  {
    group: 'System', items: [
      { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    ],
  },
]

interface LeafNavItem {
  id: string
  label: string
  icon: typeof Briefcase
  href: string
}

const HOME_ITEMS = HARDCODED_NAV[0].items as LeafNavItem[]
const SYSTEM_ITEMS = HARDCODED_NAV[2].items as LeafNavItem[]

// Map common group labels to their original parent icons. Unknown groups
// fall back to Box.
const GROUP_ICON: Record<string, typeof Briefcase> = {
  Work: Briefcase, Personal: User, Resell: Tags, Build: Hammer,
}

// Parent slugs that have dedicated dashboard pages. Clicking the group
// header navigates there in addition to toggling the child list.
const PARENT_HREF: Record<string, string> = {
  work: '/spaces/work',
  personal: '/spaces/personal',
  resell: '/spaces/resell',
  build: '/spaces/build',
}

interface NavGroup {
  id: string
  label: string
  icon: typeof Briefcase
  children: { id: string; label: string; icon: typeof Briefcase; href: string; attn?: boolean }[]
}

function buildDbSpacesNav(spaces: DbSpace[]): NavGroup[] | null {
  const visible = spaces.filter(s => !s.hidden && s.nav_group && s.nav_group.trim() !== '')
  if (visible.length === 0) return null

  const byGroup = new Map<string, DbSpace[]>()
  for (const s of visible) {
    const g = s.nav_group!
    if (!byGroup.has(g)) byGroup.set(g, [])
    byGroup.get(g)!.push(s)
  }

  return Array.from(byGroup.entries()).map(([group, members]) => ({
    id: group.toLowerCase().replace(/\s+/g, '-'),
    label: group,
    icon: GROUP_ICON[group] ?? Box,
    children: members
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(s => ({
        id: s.slug,
        label: s.label,
        icon: getIcon(s.icon),
        href: `/spaces/${s.slug}`,
        attn: s.attn,
      })),
  }))
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ work: true })
  const [dbGroups, setDbGroups] = useState<NavGroup[] | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    async function loadSpaces() {
      try {
        const res = await fetch('/api/spaces', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const built = buildDbSpacesNav(data.spaces ?? [])
        if (!cancelled && built && built.length > 0) setDbGroups(built)
      } catch {
        // swallow — hardcoded fallback remains in effect
      }
    }
    loadSpaces()
    return () => { cancelled = true }
  }, [])

  function toggleExpand(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function isActive(href?: string) {
    if (!href) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Spaces section: prefer DB-driven, fall back to hardcoded.
  const spaceGroups: NavGroup[] = dbGroups ?? (HARDCODED_NAV[1].items as NavGroup[])

  return (
    <nav className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sb-brand">
        {collapsed ? (
          <button className="sb-badge as-btn" onClick={() => setCollapsed(false)} title="Expand">
            <span className="ast">✱</span>
          </button>
        ) : (
          <>
            <div className="sb-word">This<span className="ast">✱</span>Justin</div>
            <button className="sb-collapse" onClick={() => setCollapsed(true)} title="Collapse">
              <ChevronsLeft size={18} />
            </button>
          </>
        )}
      </div>

      <div className="sb-nav-scroll">
        {/* HOME */}
        <div className="sb-section">
          <div className="sb-section-label">Home</div>
          {HOME_ITEMS.map(it => {
            const Icon = it.icon
            const active = isActive(it.href)
            return (
              <button
                key={it.id}
                className={`sb-item${active ? ' active' : ''}`}
                onClick={() => router.push(it.href)}
                title={it.label}
              >
                <Icon size={17} />
                <span className="sb-label-text">{it.label}</span>
              </button>
            )
          })}
        </div>

        {/* SPACES (DB-driven with hardcoded fallback) */}
        <div className="sb-section">
          <div className="sb-section-label">Spaces</div>
          {spaceGroups.map(g => {
            const Icon = g.icon
            const open = expanded[g.id]
            const parentHref = PARENT_HREF[g.id]
            const isActiveParent = parentHref ? isActive(parentHref) : false
            return (
              <div key={g.id}>
                <button
                  className={`sb-item${isActiveParent ? ' active' : ''}`}
                  onClick={() => {
                    if (parentHref) router.push(parentHref)
                    if (!collapsed) toggleExpand(g.id)
                  }}
                  title={g.label}
                >
                  <Icon size={17} />
                  <span className="sb-label-text">{g.label}</span>
                  {!collapsed && (open
                    ? <ChevronDown size={15} className="sb-caret" />
                    : <ChevronRight size={15} className="sb-caret" />)}
                </button>
                {open && !collapsed && (
                  <div className="sb-children">
                    {g.children.map(ch => {
                      const ChIcon = ch.icon
                      return (
                        <button
                          key={ch.id}
                          className={`sb-item sb-child${isActive(ch.href) ? ' active' : ''}`}
                          onClick={() => router.push(ch.href)}
                          title={ch.label}
                        >
                          <ChIcon size={15} />
                          <span className="sb-label-text">{ch.label}</span>
                          {ch.attn && <span className="dot-y" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* SYSTEM */}
        <div className="sb-section">
          <div className="sb-section-label">System</div>
          {SYSTEM_ITEMS.map(it => {
            const Icon = it.icon
            const active = isActive(it.href)
            return (
              <button
                key={it.id}
                className={`sb-item${active ? ' active' : ''}`}
                onClick={() => router.push(it.href)}
                title={it.label}
              >
                <Icon size={17} />
                <span className="sb-label-text">{it.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="sb-spacer" />
      <div className="sb-user">
        <div className="sb-badge">
          <span className="ast">✱</span>
        </div>
        <div className="sb-user-meta">
          <div className="nm">Justin Davis</div>
          <div className="em">justindavis227@gmail.com</div>
        </div>
      </div>
    </nav>
  )
}
