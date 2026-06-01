'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard, CalendarRange, FolderKanban,
  Briefcase, Settings, ChevronsLeft, ChevronDown, ChevronRight,
} from 'lucide-react'
import { getIcon } from '@/lib/icons'

interface DbSpace {
  slug: string
  label: string
  icon: string | null
  parent_slug: string | null
  sort_order: number
  hidden: boolean
  attn: boolean
}

interface ParentNav {
  slug: string
  label: string
  icon: typeof Briefcase
  children: { slug: string; label: string; icon: typeof Briefcase; attn?: boolean }[]
}

// Used for the first render (server + client hydration) so initial paint
// matches, and as the fallback when /api/spaces errors. Must stay in sync
// with the DB shape (no Sourcing under Resell; Build is a leaf).
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

const HOME_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'this-week', label: 'This Week', icon: CalendarRange,   href: '/this-week' },
  { id: 'projects',  label: 'Projects',  icon: FolderKanban,    href: '/projects' },
] as const

const SYSTEM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
] as const

// Pure transform — deterministic given the same `spaces` input.
function buildParents(spaces: DbSpace[]): ParentNav[] {
  const visible = spaces.filter(s => !s.hidden)
  const tops = visible.filter(s => s.parent_slug === null).sort((a, b) => a.sort_order - b.sort_order)
  return tops.map(top => ({
    slug: top.slug,
    label: top.label,
    icon: getIcon(top.icon),
    children: visible
      .filter(s => s.parent_slug === top.slug)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(c => ({
        slug: c.slug,
        label: c.label,
        icon: getIcon(c.icon),
        attn: c.attn,
      })),
  }))
}

export default function Sidebar() {
  // null = pre-mount. First server render AND first client render both fall
  // through to buildParents(HARDCODED_FALLBACK_SPACES), so hydration matches.
  // After mount, useEffect populates with real DB data.
  const [spaces, setSpaces] = useState<DbSpace[] | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ work: true })
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch('/api/spaces', { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (cancelled) return
        const fetched = (data?.spaces ?? []) as DbSpace[]
        setSpaces(fetched.length > 0 ? fetched : HARDCODED_FALLBACK_SPACES)
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('[Sidebar] /api/spaces fetch failed:', err)
        if (!cancelled) setSpaces(HARDCODED_FALLBACK_SPACES)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (collapsed) document.body.classList.add('sidebar-collapsed')
    else document.body.classList.remove('sidebar-collapsed')
    return () => { document.body.classList.remove('sidebar-collapsed') }
  }, [collapsed])

  function toggleExpand(slug: string) {
    setExpanded(prev => ({ ...prev, [slug]: !prev[slug] }))
  }

  function isHrefActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  function isParentActive(parent: ParentNav) {
    const onRoute = pathname === `/spaces/${parent.slug}`
    if (!onRoute) return false
    const tab = searchParams.get('tab')
    if (!tab || tab === 'overview') return true
    return !parent.children.some(c => c.slug === tab)
  }

  function isChildActive(parent: ParentNav, childSlug: string) {
    if (pathname !== `/spaces/${parent.slug}`) return false
    return searchParams.get('tab') === childSlug
  }

  // First render (server + first client) uses HARDCODED_FALLBACK_SPACES,
  // guaranteeing identical output. After the useEffect fetch, `spaces`
  // updates and the real DB nav replaces it.
  const parents = buildParents(spaces ?? HARDCODED_FALLBACK_SPACES)

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
            const active = isHrefActive(it.href)
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

        {/* SPACES */}
        <div className="sb-section">
          <div className="sb-section-label">Spaces</div>
          {parents.map(p => {
            const Icon = p.icon
            const parentHref = `/spaces/${p.slug}`
            const hasChildren = p.children.length > 0
            const parentActive = isParentActive(p)
            const open = expanded[p.slug]

            return (
              <div key={p.slug}>
                <button
                  className={`sb-item${parentActive ? ' active' : ''}`}
                  onClick={() => {
                    router.push(parentHref)
                    if (hasChildren && !collapsed) toggleExpand(p.slug)
                  }}
                  title={p.label}
                >
                  <Icon size={17} />
                  <span className="sb-label-text">{p.label}</span>
                  {hasChildren && !collapsed && (
                    open
                      ? <ChevronDown size={15} className="sb-caret" />
                      : <ChevronRight size={15} className="sb-caret" />
                  )}
                </button>

                {hasChildren && open && !collapsed && (
                  <div className="sb-children">
                    {p.children.map(c => {
                      const ChIcon = c.icon
                      const childActive = isChildActive(p, c.slug)
                      return (
                        <button
                          key={c.slug}
                          className={`sb-item sb-child${childActive ? ' active' : ''}`}
                          onClick={() => router.push(`/spaces/${p.slug}?tab=${c.slug}`)}
                          title={c.label}
                        >
                          <ChIcon size={15} />
                          <span className="sb-label-text">{c.label}</span>
                          {c.attn && <span className="dot-y" />}
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
            const active = isHrefActive(it.href)
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
