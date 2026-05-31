'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Save, X } from 'lucide-react'
import { ICON_NAMES, getIcon } from '@/lib/icons'

interface Space {
  id: string
  slug: string
  label: string
  parent_slug: string | null
  icon: string | null
  sort_order: number
  hidden: boolean
  attn: boolean
  nav_group: string | null
}

type Draft = Partial<Space> & { _new?: boolean }

export default function SpacesSettingsPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [adding, setAdding] = useState(false)
  const [newDraft, setNewDraft] = useState<Draft>({ slug: '', label: '', parent_slug: null, icon: 'Box', sort_order: 99 })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/spaces', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setSpaces(data.spaces ?? [])
      }
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(s: Space) {
    setEditing(s.slug)
    setDraft({ ...s })
    setError(null)
  }
  function cancelEdit() { setEditing(null); setDraft(null); setError(null) }

  async function saveEdit() {
    if (!draft || !editing || busy) return
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/spaces/${editing}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const j = await res.json()
      if (!res.ok) setError(j.error ?? 'save failed')
      else { cancelEdit(); await load() }
    } finally { setBusy(false) }
  }

  async function remove(slug: string) {
    if (!confirm(`Delete space "${slug}"? This can't be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/spaces/${slug}`, { method: 'DELETE' })
      if (res.ok) await load()
      else { const j = await res.json(); setError(j.error ?? 'delete failed') }
    } finally { setBusy(false) }
  }

  async function toggleHidden(s: Space) {
    setBusy(true)
    try {
      await fetch(`/api/spaces/${s.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !s.hidden }),
      })
      await load()
    } finally { setBusy(false) }
  }

  async function createSpace() {
    if (!newDraft.slug || !newDraft.label || busy) return
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDraft),
      })
      const j = await res.json()
      if (!res.ok) setError(j.error ?? 'create failed')
      else {
        setAdding(false)
        setNewDraft({ slug: '', label: '', parent_slug: null, icon: 'Box', sort_order: 99 })
        await load()
      }
    } finally { setBusy(false) }
  }

  const topLevels = spaces.filter(s => !s.parent_slug).sort((a, b) => a.sort_order - b.sort_order)
  const childrenOf = (slug: string) => spaces.filter(s => s.parent_slug === slug).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="content-inner">
      <div className="section">
        <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="section-eyebrow">Settings · Spaces</span>
          <button className="btn btn-primary sm" onClick={() => setAdding(true)} disabled={adding}>
            <Plus size={13} /> Add space
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 10, padding: 10, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#FCA5A5', fontSize: 12 }}>
            {error}
          </div>
        )}

        {adding && (
          <div className="dcard" style={{ marginTop: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="dcard-eyebrow">New space</span>
              <button className="x" onClick={() => setAdding(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              <Input label="Slug"   value={newDraft.slug ?? ''}    onChange={v => setNewDraft(d => ({ ...d, slug: v.toLowerCase() }))} />
              <Input label="Label"  value={newDraft.label ?? ''}   onChange={v => setNewDraft(d => ({ ...d, label: v }))} />
              <ParentPick value={newDraft.parent_slug ?? ''} options={topLevels.map(t => ({ slug: t.slug, label: t.label }))} onChange={v => setNewDraft(d => ({ ...d, parent_slug: v || null }))} />
              <IconPick value={newDraft.icon ?? 'Box'} onChange={v => setNewDraft(d => ({ ...d, icon: v }))} />
              <Input label="Sort"   value={String(newDraft.sort_order ?? 99)} onChange={v => setNewDraft(d => ({ ...d, sort_order: Number(v) || 0 }))} />
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary sm" onClick={() => setAdding(false)}>Cancel</button>
              <button className="btn btn-primary sm" onClick={createSpace} disabled={busy || !newDraft.slug || !newDraft.label}>
                Create
              </button>
            </div>
          </div>
        )}

        {loading && <div className="empty" style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>Loading…</div>}

        {!loading && topLevels.map(parent => {
          const children = childrenOf(parent.slug)
          return (
            <div key={parent.id} style={{ marginTop: 18 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                {parent.label}
              </div>
              <div className="dcard" style={{ padding: 0, overflow: 'hidden' }}>
                <SpaceRow
                  s={parent}
                  editing={editing === parent.slug}
                  draft={draft}
                  setDraft={setDraft}
                  topLevels={topLevels}
                  onStartEdit={() => startEdit(parent)}
                  onCancel={cancelEdit}
                  onSave={saveEdit}
                  onToggle={() => toggleHidden(parent)}
                  onRemove={() => remove(parent.slug)}
                  busy={busy}
                />
                {children.map(c => (
                  <SpaceRow
                    key={c.id}
                    s={c}
                    isChild
                    editing={editing === c.slug}
                    draft={draft}
                    setDraft={setDraft}
                    topLevels={topLevels}
                    onStartEdit={() => startEdit(c)}
                    onCancel={cancelEdit}
                    onSave={saveEdit}
                    onToggle={() => toggleHidden(c)}
                    onRemove={() => remove(c.slug)}
                    busy={busy}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SpaceRow({
  s, isChild, editing, draft, setDraft, topLevels,
  onStartEdit, onCancel, onSave, onToggle, onRemove, busy,
}: {
  s: Space
  isChild?: boolean
  editing: boolean
  draft: Draft | null
  setDraft: (d: ((prev: Draft | null) => Draft | null)) => void
  topLevels: Space[]
  onStartEdit: () => void
  onCancel: () => void
  onSave: () => void
  onToggle: () => void
  onRemove: () => void
  busy: boolean
}) {
  const Icon = getIcon(s.icon)
  return (
    <div style={{
      padding: 12,
      paddingLeft: isChild ? 36 : 12,
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: s.hidden ? 0.45 : 1,
    }}>
      {editing && draft ? (
        <>
          <Icon size={16} />
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr 0.4fr', gap: 8 }}>
            <Input label="Label" value={draft.label ?? ''} onChange={v => setDraft(d => d ? ({ ...d, label: v }) : d)} />
            <ParentPick value={draft.parent_slug ?? ''} options={topLevels.filter(t => t.slug !== s.slug).map(t => ({ slug: t.slug, label: t.label }))} onChange={v => setDraft(d => d ? ({ ...d, parent_slug: v || null }) : d)} />
            <IconPick value={draft.icon ?? 'Box'} onChange={v => setDraft(d => d ? ({ ...d, icon: v }) : d)} />
            <Input label="Sort" value={String(draft.sort_order ?? 0)} onChange={v => setDraft(d => d ? ({ ...d, sort_order: Number(v) || 0 }) : d)} />
          </div>
          <button className="btn btn-primary sm" onClick={onSave} disabled={busy}>
            <Save size={13} /> Save
          </button>
          <button className="btn btn-secondary sm" onClick={onCancel}>Cancel</button>
        </>
      ) : (
        <>
          <Icon size={16} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
              /{s.slug}{s.parent_slug ? ` · child of ${s.parent_slug}` : ' · top level'} · sort {s.sort_order}{s.attn ? ' · attn' : ''}
            </div>
          </div>
          <button className="btn btn-secondary sm" onClick={onToggle} title={s.hidden ? 'Show' : 'Hide'}>
            {s.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button className="btn btn-secondary sm" onClick={onStartEdit}>Edit</button>
          <button className="btn btn-secondary sm" onClick={onRemove} title="Delete">
            <Trash2 size={13} />
          </button>
        </>
      )}
    </div>
  )
}

function Input({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 6,
          padding: '6px 8px',
          color: 'inherit',
          fontSize: 12,
        }}
      />
    </label>
  )
}

function IconPick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Icon</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 6,
          padding: '6px 8px',
          color: 'inherit',
          fontSize: 12,
        }}
      >
        {ICON_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>
  )
}

function ParentPick({ value, options, onChange }: {
  value: string
  options: { slug: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Parent</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 6,
          padding: '6px 8px',
          color: 'inherit',
          fontSize: 12,
        }}
      >
        <option value="">— top level —</option>
        {options.map(o => <option key={o.slug} value={o.slug}>{o.label}</option>)}
      </select>
    </label>
  )
}
