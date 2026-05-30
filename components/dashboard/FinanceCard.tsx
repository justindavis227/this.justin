import { Lock } from 'lucide-react'

export default function FinanceCard() {
  return (
    <div className="dcard finance-card">
      <div className="dcard-head">
        <span className="dcard-eyebrow">Finance</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
        <span className="fin-note">
          <Lock size={13} /> Phase 3 — Google Sheet sync pending
        </span>
      </div>

      <div className="nw-wrap">
        <div style={{ filter: 'blur(10px)', opacity: .55, pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
            Net Worth
          </div>
          <div className="nw-num">$614,040</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            ↑ $12,400 this month
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
        Connect Google Sheets in Phase 3 to see live net worth, budget, and account data.
      </div>
    </div>
  )
}
