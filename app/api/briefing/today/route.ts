import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { gatherFacts, generateBriefing } from '@/lib/briefing'
import { format } from 'date-fns'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const url = new URL(req.url)
  const force = url.searchParams.get('refresh') === '1'
  const today = new Date()
  const dateStr = format(today, 'yyyy-MM-dd')

  const db = supabaseAdmin()

  if (!force) {
    const { data: existing } = await db
      .from('briefings')
      .select('*')
      .eq('briefing_date', dateStr)
      .maybeSingle()
    if (existing) {
      return Response.json({
        date: existing.briefing_date,
        body: existing.body,
        facts: existing.facts,
        cached: true,
      })
    }
  }

  const facts = await gatherFacts(today)
  const body = await generateBriefing(facts)

  await db.from('briefings').upsert(
    { briefing_date: dateStr, body, facts },
    { onConflict: 'briefing_date' }
  )

  return Response.json({ date: dateStr, body, facts, cached: false })
}
