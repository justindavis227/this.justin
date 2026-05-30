'use client'

import { Flame, MapPin } from 'lucide-react'
import { Task } from '@/lib/types'

const BIG3_TIERS: Array<'now' | 'soon'> = ['now', 'now', 'soon']

interface Props {
  nowTasks: Task[]
  streakDays?: number
}

export default function OperatorCard({ nowTasks, streakDays = 0 }: Props) {
  const big3 = nowTasks.slice(0, 3)

  return (
    <div className="dcard op-card">
      <div className="dcard-head">
        <span className="dcard-eyebrow">Operator</span>
      </div>

      <div className="op-main">
        <div className="op-top">
          <div style={{
            width: 46, height: 46, borderRadius: 14, background: 'var(--os-black)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: 'var(--live-yellow)', fontWeight: 700, fontSize: 24, lineHeight: 1 }}>✱</span>
          </div>
          <div className="op-id">
            <div className="op-name">Justin Davis</div>
            <div className="op-role">Youth Pastor · CMT</div>
            <div className="op-loc">
              <MapPin size={12} /> Louisville, KY · ET
            </div>
          </div>
        </div>

        <div className="op-divider" />

        <div className="op-big3">
          <div className="op-big3-h">This week · Big 3</div>
          {big3.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>No now tasks — add one to capture.</div>
          ) : (
            big3.map((t, i) => (
              <div className="b3-row" key={t.id}>
                <div className="b3-num">{i + 1}</div>
                <div className="b3-text">{t.title}</div>
              </div>
            ))
          )}
          {big3.length < 3 && Array.from({ length: 3 - big3.length }, (_, i) => (
            <div className="b3-row" key={`empty-${i}`} style={{ opacity: .4 }}>
              <div className="b3-num">{big3.length + i + 1}</div>
              <div className="b3-text" style={{ color: 'var(--muted)', fontWeight: 400 }}>—</div>
            </div>
          ))}
        </div>

        <div className="op-divider" />

        <div className="op-streak">
          <div className="streak-num">
            <Flame size={20} style={{ color: 'var(--live-yellow-600)' }} />
            <span>{streakDays}</span>
          </div>
          <div className="streak-meta">
            <div className="streak-label">day streak</div>
            <div className="streak-sub">Read scripture · daily</div>
          </div>
        </div>
      </div>
    </div>
  )
}
