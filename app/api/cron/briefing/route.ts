import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { gatherFacts, generateBriefing } from '@/lib/briefing'
import { format } from 'date-fns'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  const dateStr = format(today, 'yyyy-MM-dd')
  const db = supabaseAdmin()

  const { data: existing } = await db
    .from('briefings')
    .select('briefing_date')
    .eq('briefing_date', dateStr)
    .maybeSingle()

  if (existing) {
    return Response.json({ ok: true, date: dateStr, generated: false, reason: 'already exists' })
  }

  const facts = await gatherFacts(today)
  const body = await generateBriefing(facts)

  const { error } = await db.from('briefings').upsert(
    { briefing_date: dateStr, body, facts },
    { onConflict: 'briefing_date' }
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, date: dateStr, generated: true })
}
