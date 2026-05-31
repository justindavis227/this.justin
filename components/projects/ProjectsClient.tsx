'use client'

import { useState, useMemo } from 'react'
import { Project } from '@/lib/types'
import { ExternalLink } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import StatusBadge, { SpaceStatus } from '@/components/spaces/shared/StatusBadge'
import KpiCard from '@/components/spaces/shared/KpiCard'
import KpiRow from '@/components/spaces/shared/KpiRow'

const FILTERS = [
  { id: 'all',      label: 'All',      groups: null as string[] | null },
  { id: 'work',     label: 'Work',     groups: ['southeast', 'students'] },
  { id: 'personal', label: 'Personal', groups: ['family', 'finance', 'journal', 'health'] },
  { id: 'resell',   label: 'Resell',   groups: ['resell'] },
  { id: 'build',    label: 'Build',    groups: ['build'] },
]

function statusForProject(p: Project): SpaceStatus {
  switch (p.status) {
    case 'active':   return 'active'
    case 'attn':     return 'attention'
    case 'complete': return 'complete'
    case 'idea':     return 'idea'
    default:         return 'idle'
  }
}

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState('all')

  const counts = useMemo(() => ({
    total:     projects.length,
    active:    projects.filter(p => p.status === 'active').length,
    attention: projects.filter(p => p.status === 'attn').length,
    complete:  projects.filter(p => p.status === 'complete').length,
  }), [projects])

  const visible = useMemo(() => {
    const f = FILTERS.find(x => x.id === filter)
    if (!f || !f.groups) return projects
    return projects.filter(p => p.space_slug && f.groups!.includes(p.space_slug))
  }, [projects, filter])

  return (
    <div className="content-inner">
      <div className="section" style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Projects</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
          Everything you’re actively building, across every space.
        </p>
      </div>

      <KpiRow cols={4}>
        <KpiCard label="Total"           value={String(counts.total)}     subtitle="all statuses" accent="#9CA3AF" />
        <KpiCard label="Active"          value={String(counts.active)}    subtitle="in motion"    accent="#3B82F6" />
        <KpiCard label="Needs Attention" value={String(counts.attention)} subtitle="blocked or stale" accent="#FBBF24" />
        <KpiCard label="Complete"        value={String(counts.complete)}  subtitle="shipped"      accent="#10B981" />
      </KpiRow>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: f.id === filter ? 'rgba(255,255,255,0.10)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 999,
                color: f.id === filter ? 'var(--fg)' : 'var(--muted)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                padding: '4px 12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 0.4,
              }}
            >{f.label}</button>
          ))}
        </div>
        <button className="btn btn-secondary sm" disabled>
          <ExternalLink size={13} /> Open in Craft
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="empty" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
          {projects.length === 0 ? 'No projects yet. Capture one or add via Supabase.' : 'No projects match this filter.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {visible.map(p => {
            const status = statusForProject(p)
            return (
              <div key={p.id} className="dcard" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)',
                  }}>
                    {p.space_slug ?? '—'}
                  </span>
                  <StatusBadge status={status} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}>{p.name}</div>
                {p.description && (
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.description}</div>
                )}
                <div style={{ marginTop: 4 }}>
                  <div className="track sm">
                    <span style={{ width: `${p.pct ?? 0}%`, background: '#3B82F6' }} />
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)',
                  }}>
                    <span>{p.status} · {p.pct ?? 0}%</span>
                    <span>updated {formatDistanceToNow(parseISO(p.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
