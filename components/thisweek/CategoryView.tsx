import { Task } from '@/lib/types'

const SPACE_ORDER = ['southeast', 'students', 'family', 'finance', 'journal', 'health', 'resell', 'build']

export default function CategoryView({ tasks }: { tasks: Task[] }) {
  const spaces = new Set(tasks.map(t => t.space_slug).filter(Boolean) as string[])
  const orderedSpaces = [
    ...SPACE_ORDER.filter(s => spaces.has(s)),
    ...[...spaces].filter(s => !SPACE_ORDER.includes(s)),
  ]

  return (
    <div>
      {orderedSpaces.map((sp) => {
        const items = tasks.filter(t => t.space_slug === sp)
        return (
          <div key={sp} className="cat-group">
            <div className="section-head">
              <span className="section-eyebrow">{sp}</span>
              <span className="section-count">{items.length}</span>
            </div>
            <div className="cat-list">
              {items.map((t) => (
                <div key={t.id} className="tcard" style={{ cursor: 'default' }}>
                  <div className="tt">{t.title}</div>
                  <div className="tmeta">
                    <span className="tspace">{t.tier}</span>
                    {t.due_date && <span className="tdue">{t.due_date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {tasks.length === 0 && (
        <div className="empty">No tasks yet. Capture one to get started.</div>
      )}
    </div>
  )
}
