import React from 'react'
import StatusBadge, { SpaceStatus } from './StatusBadge'

export interface FocusItemData {
  id: string
  title: string
  subtitle?: string
  status?: SpaceStatus
  contextTag?: string
  rightText?: string
  leftText?: string
}

interface ListProps {
  title: string
  count?: number
  items: FocusItemData[]
  empty?: string
}

export function FocusList({ title, count, items, empty }: ListProps) {
  return (
    <div className="dcard" style={{ padding: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        marginBottom: 10,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          color: 'var(--muted)',
        }}>{title}</span>
        {typeof count === 'number' && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{count}</span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="empty" style={{ fontSize: 12, color: 'var(--muted)' }}>
          {empty ?? 'Nothing here yet.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map(it => <FocusItem key={it.id} item={it} />)}
        </div>
      )}
    </div>
  )
}

export function FocusItem({ item }: { item: FocusItemData }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 0',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      {item.leftText && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--muted)',
          minWidth: 44,
          textAlign: 'right',
          flexShrink: 0,
        }}>{item.leftText}</span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </div>
        {item.subtitle && (
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            {item.subtitle}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {item.status && <StatusBadge status={item.status} />}
        {item.contextTag && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}>{item.contextTag}</span>
        )}
        {item.rightText && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
            {item.rightText}
          </span>
        )}
      </div>
    </div>
  )
}
