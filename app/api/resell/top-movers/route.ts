import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { startOfMonth, format } from 'date-fns'

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('resell_inventory')
    .select('id, description, category, sold_price, net_profit, date_sold, platform_sold')
    .gte('date_sold', monthStart)
    .not('net_profit', 'is', null)
    .order('net_profit', { ascending: false })
    .limit(8)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ movers: data ?? [] })
}
