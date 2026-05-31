import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

interface IncomingReminder {
  uid: string
  title: string
  due_at: string | null
  completed: boolean
  list_name?: string | null
  raw?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const body = await req.json()
  const reminders: IncomingReminder[] = Array.isArray(body.reminders) ? body.reminders : []

  if (reminders.length === 0) {
    return Response.json({ ok: true, upserted: 0 })
  }

  const db = supabaseAdmin()
  const rows = reminders.map(r => ({
    ext_id: r.uid,
    title: r.title,
    due_at: r.due_at,
    completed: r.completed ?? false,
    list_name: r.list_name ?? null,
    raw: r.raw ?? null,
    synced_at: new Date().toISOString(),
  }))

  const deduped = Object.values(
    rows.reduce<Record<string, typeof rows[number]>>((acc, r) => {
      acc[r.ext_id] = r
      return acc
    }, {})
  )

  const { error, count } = await db
    .from('reminders')
    .upsert(deduped, { onConflict: 'ext_id', count: 'exact' })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, upserted: count })
}
