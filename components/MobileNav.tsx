'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Briefcase, User, Tags, Hammer, Settings } from 'lucide-react'

const ITEMS = [
  { id: 'home',     label: 'Home',     href: '/dashboard',       icon: LayoutDashboard },
  { id: 'work',     label: 'Work',     href: '/spaces/work',     icon: Briefcase },
  { id: 'personal', label: 'Personal', href: '/spaces/personal', icon: User },
  { id: 'resell',   label: 'Resell',   href: '/spaces/resell',   icon: Tags },
  { id: 'build',    label: 'Build',    href: '/spaces/build',    icon: Hammer },
  { id: 'settings', label: 'Settings', href: '/settings',        icon: Settings },
]

export default function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/' || pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="mobile-nav" aria-label="Primary">
      <div className="mobile-nav-inner">
        {ITEMS.map(it => {
          const Icon = it.icon
          const active = isActive(it.href)
          return (
            <button
              key={it.id}
              className={`mobile-nav-item${active ? ' active' : ''}`}
              onClick={() => router.push(it.href)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon />
              <span>{it.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
