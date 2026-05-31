import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { fmtDate } from '@/lib/habits'

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const body = await req.json()
  const slug = body.slug as string | undefined
  const done = body.done as boolean | undefined
  const date = (body.date as string | undefined) ?? fmtDate(new Date())

  if (!slug || typeof done !== 'boolean') {
    return Response.json({ error: 'slug and done required' }, { status: 400 })
  }

  const db = supabaseAdmin()

  if (done) {
    const { error } = await db
      .from('habit_log')
      .upsert({ habit_slug: slug, log_date: date, done: true }, { onConflict: 'habit_slug,log_date' })
    if (error) return Response.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await db
      .from('habit_log')
      .delete()
      .eq('habit_slug', slug)
      .eq('log_date', date)
    if (error) return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
