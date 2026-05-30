export type TaskTier = 'now' | 'soon' | 'later' | 'someday'
export type GoalScope = 'annual' | 'quarter'
export type ProjectStatus = 'idea' | 'active' | 'attn' | 'complete'
export type CalendarSource = 'work_personal' | 'work_students' | 'apple_personal' | 'apple_family' | 'reminders'

export interface Task {
  id: string
  title: string
  description: string | null
  space_slug: string | null
  tier: TaskTier
  is_key: boolean
  priority_score: number
  tags: string[] | null
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  scope: GoalScope
  text: string
  done: boolean
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  space_slug: string | null
  status: ProjectStatus
  pct: number
  meta: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  ext_id: string
  source: CalendarSource
  title: string
  start_at: string | null
  end_at: string | null
  all_day: boolean
  location: string | null
  is_reminder: boolean
  raw: Record<string, unknown> | null
  synced_at: string
}

export interface Capture {
  id: string
  source: string
  raw_text: string | null
  audio_url: string | null
  classification: CaptureClassification | null
  llm_source: string | null
  routed_to: string | null
  routed_id: string | null
  created_at: string
}

export interface CaptureClassification {
  kind: 'task' | 'note' | 'idea' | 'habit' | 'journal'
  space_slug: string | null
  urgency: TaskTier
  tags: string[]
  summary: string
}

export interface DailyLog {
  id: string
  log_date: string
  notes: DailyLogNotes | null
  created_at: string
  updated_at: string
}

export interface DailyLogNotes {
  habits?: Record<string, boolean>
  macros?: { cal?: number; protein?: number; carbs?: number; fat?: number }
  mood?: number
}

export interface Space {
  id: string
  slug: string
  label: string
  parent_slug: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export const CAL_SOURCES: { id: CalendarSource; label: string; enabled: boolean; color: string }[] = [
  { id: 'work_personal',  label: 'Work',        enabled: true,  color: '#3B82F6' },
  { id: 'work_students',  label: 'BB Students', enabled: false, color: '#6366F1' },
  { id: 'apple_personal', label: 'Personal',    enabled: true,  color: '#10B981' },
  { id: 'apple_family',   label: 'Family',      enabled: true,  color: '#E0568A' },
  { id: 'reminders',      label: 'Reminders',   enabled: true,  color: '#F59E0B' },
]

export const TIER_META: Record<TaskTier, { label: string; color: string }> = {
  now:     { label: 'Now',     color: '#EF4444' },
  soon:    { label: 'Soon',    color: '#FBBF24' },
  later:   { label: 'Later',   color: '#3B82F6' },
  someday: { label: 'Someday', color: '#9CA3AF' },
}
