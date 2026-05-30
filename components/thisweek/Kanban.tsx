'use client'

import { useState, useRef } from 'react'
import { Task, TaskTier, TIER_META } from '@/lib/types'
import { Plus } from 'lucide-react'

interface Props {
  initialTasks: Task[]
}

function Chip({ status }: { status: string }) {
  return (
    <span className={`chip ${status}`}>
      <span className="dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function TaskCard({ task, dragging, onDragStart, onDragOver, onDragEnd, onComplete }: {
  task: Task
  dragging: boolean
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnd: () => void
  onComplete: (id: string) => void
}) {
  return (
    <div
      className={`tcard${dragging ? ' dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="tt">{task.title}</div>
      <div className="tmeta">
        {task.space_slug && <span className="tspace">{task.space_slug}</span>}
        {task.due_date && <span className="tdue">{task.due_date}</span>}
        <button
          onClick={() => onComplete(task.id)}
          style={{
            marginLeft: 'auto', background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'var(--muted)', cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
          }}
        >
          done
        </button>
      </div>
    </div>
  )
}

const TIERS: { id: TaskTier }[] = [
  { id: 'now' }, { id: 'soon' }, { id: 'later' }, { id: 'someday' },
]

export default function Kanban({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [dragId, setDragId] = useState<string | null>(null)
  const dragRef = useRef<string | null>(null)

  async function moveTier(taskId: string, newTier: TaskTier) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, tier: newTier } : t))
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: newTier }),
    })
  }

  async function completeTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_at: new Date().toISOString() }),
    })
  }

  function reorder(targetId: string) {
    const draggedId = dragRef.current
    setTasks(prev => {
      const dragged = prev.find(t => t.id === draggedId)
      if (!dragged) return prev
      const without = prev.filter(t => t.id !== draggedId)
      const idx = without.findIndex(t => t.id === targetId)
      if (idx < 0) return prev
      without.splice(idx, 0, dragged)
      return without
    })
  }

  return (
    <div className="kanban">
      {TIERS.map(({ id }) => {
        const meta = TIER_META[id]
        const items = tasks.filter(t => t.tier === id)

        return (
          <div
            key={id}
            className="kcol"
            onDragOver={(e) => {
              e.preventDefault()
              if (dragRef.current) {
                const dragged = tasks.find(t => t.id === dragRef.current)
                if (dragged && dragged.tier !== id) {
                  moveTier(dragRef.current, id)
                }
              }
            }}
          >
            <div className="kcol-head">
              <span className="kcol-dot" style={{ background: meta.color }} />
              <span className="kcol-title">{meta.label}</span>
              <span className="kcol-count">{items.length}</span>
            </div>

            {items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                dragging={dragId === task.id}
                onDragStart={() => { dragRef.current = task.id; setDragId(task.id) }}
                onDragOver={(e) => { e.preventDefault(); reorder(task.id) }}
                onDragEnd={() => { dragRef.current = null; setDragId(null) }}
                onComplete={completeTask}
              />
            ))}

            {items.length === 0 && <div className="kcol-empty">—</div>}

            <button
              className="ghost-add"
              style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
              onClick={async () => {
                const title = prompt('Task title:')
                if (!title?.trim()) return
                const res = await fetch('/api/tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: title.trim(), tier: id }),
                })
                if (res.ok) {
                  const { task } = await res.json()
                  setTasks(prev => [...prev, task])
                }
              }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
        )
      })}
    </div>
  )
}
