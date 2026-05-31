import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { format } from 'date-fns'

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const url = new URL(req.url)
  const date = url.searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd')

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('macro_entries')
    .select('*')
    .eq('log_date', date)
    .order('created_at')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const entries = data ?? []
  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories ?? 0),
      protein_g: acc.protein_g + (e.protein_g ?? 0),
      carbs_g: acc.carbs_g + (e.carbs_g ?? 0),
      fat_g: acc.fat_g + (e.fat_g ?? 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  return Response.json({ date, entries, totals })
}
