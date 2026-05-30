import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const db = supabaseAdmin()
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? new Date().toISOString()
  const to = searchParams.get('to')

  let query = db
    .from('calendar_events')
    .select('*')
    .gte('start_at', from)
    .order('start_at')

  if (to) query = query.lte('start_at', to)

  const { data, error } = await query.limit(200)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ events: data })
}
