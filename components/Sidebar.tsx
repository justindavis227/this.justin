'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CalendarRange, FolderKanban,
  Briefcase, MapPin, GraduationCap, User, Users, Wallet, BookOpen, Heart,
  Tags, Search, Tag, Hammer, FlaskConical, Palette,
  Settings, ChevronsLeft, ChevronDown, ChevronRight,
} from 'lucide-react'

const NAV = [
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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ work: true, personal: false, resell: false, build: false })
  const pathname = usePathname()
  const router = useRouter()

  function toggleExpand(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function isActive(href?: string) {
    if (!href) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

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
        {NAV.map((sec) => (
          <div className="sb-section" key={sec.group}>
            <div className="sb-section-label">{sec.group}</div>
            {sec.items.map((it) => {
              const Icon = it.icon
              const hasChildren = 'children' in it && it.children && it.children.length > 0
              const open = expanded[it.id]
              const active = isActive('href' in it ? it.href : undefined)

              return (
                <div key={it.id}>
                  <button
                    className={`sb-item${active ? ' active' : ''}`}
                    onClick={() => {
                      if ('href' in it && it.href) router.push(it.href)
                      if (hasChildren && !collapsed) toggleExpand(it.id)
                    }}
                    title={it.label}
                  >
                    <Icon size={17} />
                    <span className="sb-label-text">{it.label}</span>
                    {hasChildren && !collapsed && (
                      open
                        ? <ChevronDown size={15} className="sb-caret" />
                        : <ChevronRight size={15} className="sb-caret" />
                    )}
                  </button>

                  {hasChildren && open && !collapsed && (
                    <div className="sb-children">
                      {('children' in it ? it.children ?? [] : []).map((ch) => {
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
                            {'attn' in ch && ch.attn && <span className="dot-y" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
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
