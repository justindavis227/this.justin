'use client'

import { useState } from 'react'
import { Columns3, Sparkles, LayoutGrid } from 'lucide-react'
import { Task } from '@/lib/types'
import Kanban from './Kanban'
import SmartSearch from './SmartSearch'
import CategoryView from './CategoryView'

const TABS = [
  { id: 'kanban',   label: 'Kanban',   Icon: Columns3 },
  { id: 'smart',    label: 'Smart',    Icon: Sparkles },
  { id: 'category', label: 'Category', Icon: LayoutGrid },
] as const

type TabId = 'kanban' | 'smart' | 'category'

export default function WeekTabsClient({ tasks }: { tasks: Task[] }) {
  const [tab, setTab] = useState<TabId>('kanban')

  return (
    <>
      <div className="tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`tab${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'kanban'   && <Kanban initialTasks={tasks} />}
      {tab === 'smart'    && <SmartSearch tasks={tasks} />}
      {tab === 'category' && <CategoryView tasks={tasks} />}
    </>
  )
}
