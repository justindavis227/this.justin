import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

interface IncomingEvent {
  uid: string
  source: string
  title: string
  start_at: string | null
  end_at: string | null
  all_day: boolean
  location?: string | null
  is_reminder: boolean
  raw?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const body = await req.json()
  const events: IncomingEvent[] = Array.isArray(body.events) ? body.events : []

  if (events.length === 0) {
    return Response.json({ ok: true, upserted: 0 })
  }

  const db = supabaseAdmin()
  const rows = events.map(e => ({
    ext_id: e.uid,
    source: e.source,
    title: e.title,
    start_at: e.start_at,
    end_at: e.end_at,
    all_day: e.all_day ?? false,
    location: e.location ?? null,
    is_reminder: e.is_reminder ?? false,
    raw: e.raw ?? null,
    synced_at: new Date().toISOString(),
  }))

  const { error, count } = await db
    .from('calendar_events')
    .upsert(rows, { onConflict: 'ext_id', count: 'exact' })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, upserted: count })
}
