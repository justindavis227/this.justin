export default function MacrosCard() {
  const goals = { cal: 2200, protein: 180, carbs: 220, fat: 70 }

  return (
    <div className="dcard" style={{ gridArea: 'macros' }}>
      <div className="dcard-head">
        <span className="dcard-eyebrow">Macros · Today</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>Phase 2</span>
      </div>

      <div className="macro-quad">
        {[
          { label: 'Calories', goal: goals.cal, unit: 'kcal', color: '#EF4444' },
          { label: 'Protein',  goal: goals.protein, unit: 'g',   color: '#3B82F6' },
          { label: 'Carbs',    goal: goals.carbs,   unit: 'g',   color: '#FBBF24' },
          { label: 'Fat',      goal: goals.fat,     unit: 'g',   color: '#10B981' },
        ].map(({ label, goal, unit, color }) => (
          <div key={label} className="mq-cell">
            <div className="mq-top">
              <span className="mq-label">{label}</span>
              <span className="mq-pct">—</span>
            </div>
            <div className="mq-val">— <span className="mq-g">/ {goal}{unit}</span></div>
            <div className="track sm">
              <span style={{ width: '0%', background: color }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        Track macros in Phase 2 — voice capture or manual entry.
      </div>
    </div>
  )
}
