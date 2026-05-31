import { supabaseAdmin } from '@/lib/supabase'
import { Task, Project, CalendarEvent, Capture } from '@/lib/types'
import { format, parseISO, startOfDay, addDays } from 'date-fns'

interface Props {
  slug: string
  label: string
}

const TIER_COLOR: Record<string, string> = {
  now:     '#EF4444',
  soon:    '#FBBF24',
  later:   '#3B82F6',
  someday: '#9CA3AF',
}

export default async function GenericSpaceDashboard({ slug, label }: Props) {
  const db = supabaseAdmin()
  const today = new Date()
  const lookahead = addDays(today, 30)

  const [tasksRes, projectsRes, capturesRes, eventsRes] = await Promise.all([
    db.from('tasks')
      .select('*')
      .eq('space_slug', slug)
      .is('completed_at', null)
      .order('priority_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
    db.from('projects')
      .select('*')
      .eq('space_slug', slug)
      .neq('status', 'complete')
      .order('updated_at', { ascending: false }),
    db.from('captures')
      .select('id, classification, raw_text, created_at, routed_to')
      .order('created_at', { ascending: false })
      .limit(50),
    db.from('calendar_events')
      .select('*')
      .gte('start_at', startOfDay(today).toISOString())
      .lte('start_at', lookahead.toISOString())
      .order('start_at')
      .limit(50),
  ])

  const tasks      = (tasksRes.data ?? []) as Task[]
  const projects   = (projectsRes.data ?? []) as Project[]
  const allCaptures = (capturesRes.data ?? []) as Capture[]
  const allEvents  = (eventsRes.data ?? []) as CalendarEvent[]

  const captures = allCaptures
    .filter(c => c.classification?.space_slug === slug)
    .slice(0, 8)

  // Loose match: for work spaces (southeast/students), show all work_* events.
  const events = allEvents.filter(e => spaceMatchesEvent(slug, e)).slice(0, 6)

  return (
    <div className="content-inner">
      <div className="section">
        <div className="section-head">
          <span className="section-eyebrow">{label}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginTop: 14 }}>
          {/* LEFT — Tasks + Projects */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="dcard">
              <div className="dcard-head">
                <span className="dcard-eyebrow">Open tasks · {tasks.length}</span>
              </div>
              {tasks.length === 0 ? (
                <div className="empty" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                  No open tasks in this space.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {tasks.slice(0, 10).map(t => (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.05)',
                      fontSize: 13,
                    }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: 999,
                        background: TIER_COLOR[t.tier] ?? '#9CA3AF',
                        flexShrink: 0,
                      }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>
                        {t.tier}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dcard">
              <div className="dcard-head">
                <span className="dcard-eyebrow">Active projects · {projects.length}</span>
              </div>
              {projects.length === 0 ? (
                <div className="empty" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                  No active projects.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {projects.slice(0, 8).map(p => (
                    <div key={p.id} style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span>{p.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{p.pct}%</span>
                      </div>
                      <div className="track sm" style={{ marginTop: 4 }}>
                        <span style={{ width: `${p.pct ?? 0}%`, background: '#3B82F6' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Events + Captures */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="dcard">
              <div className="dcard-head">
                <span className="dcard-eyebrow">Upcoming · 30 days</span>
              </div>
              {events.length === 0 ? (
                <div className="empty" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                  No upcoming events.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  {events.map(e => (
                    <div key={e.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '4px 0', fontSize: 12,
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', width: 80, flexShrink: 0 }}>
                        {e.start_at ? format(parseISO(e.start_at), 'MMM d, h:mma') : ''}
                      </span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dcard">
              <div className="dcard-head">
                <span className="dcard-eyebrow">Recent captures · {captures.length}</span>
              </div>
              {captures.length === 0 ? (
                <div className="empty" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                  No captures tagged to this space yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {captures.map(c => (
                    <div key={c.id} style={{
                      padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 12,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>
                          {c.classification?.kind ?? '—'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
                          {format(parseISO(c.created_at), 'MMM d')}
                        </span>
                      </div>
                      <div>{c.classification?.summary ?? c.raw_text?.slice(0, 120) ?? ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function spaceMatchesEvent(slug: string, e: CalendarEvent): boolean {
  // Work spaces consume work_* calendar sources
  if (slug === 'southeast' || slug === 'students') {
    return e.source === 'work_personal' || e.source === 'work_students'
  }
  if (slug === 'family') return e.source === 'apple_family'
  if (slug === 'health' || slug === 'journal') return e.source === 'apple_personal'
  return false
}
