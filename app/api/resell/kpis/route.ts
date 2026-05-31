import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { startOfMonth, endOfMonth, startOfYear, format } from 'date-fns'

interface InventoryRow {
  category: string | null
  date_sold: string | null
  sold_price: number | string | null
  net_profit: number | string | null
  fees: number | string | null
  promoted_fees: number | string | null
  shipping_cost: number | string | null
  cost_of_goods: number | string | null
}

interface ExpenseRow { expense_date: string | null; amount: number | string | null }
interface MileageRow { log_date: string | null; total_miles: number | string | null }

function n(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return v
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd   = format(endOfMonth(now),   'yyyy-MM-dd')
  const yearStart  = format(startOfYear(now),  'yyyy-MM-dd')

  const db = supabaseAdmin()

  const [invMtdRes, invYtdRes, expMtdRes, expYtdRes, milMtdRes, milYtdRes, lastSyncRes] = await Promise.all([
    db.from('resell_inventory')
      .select('category, date_sold, sold_price, net_profit, fees, promoted_fees, shipping_cost, cost_of_goods')
      .gte('date_sold', monthStart).lte('date_sold', monthEnd),
    db.from('resell_inventory')
      .select('category, date_sold, sold_price, net_profit, fees, promoted_fees, shipping_cost, cost_of_goods')
      .gte('date_sold', yearStart),
    db.from('resell_expenses').select('expense_date, amount').gte('expense_date', monthStart).lte('expense_date', monthEnd),
    db.from('resell_expenses').select('expense_date, amount').gte('expense_date', yearStart),
    db.from('resell_mileage').select('log_date, total_miles').gte('log_date', monthStart).lte('log_date', monthEnd),
    db.from('resell_mileage').select('log_date, total_miles').gte('log_date', yearStart),
    db.from('resell_inventory').select('synced_at').order('synced_at', { ascending: false }).limit(1),
  ])

  const invMtd = (invMtdRes.data ?? []) as InventoryRow[]
  const invYtd = (invYtdRes.data ?? []) as InventoryRow[]
  const expMtd = (expMtdRes.data ?? []) as ExpenseRow[]
  const expYtd = (expYtdRes.data ?? []) as ExpenseRow[]
  const milMtd = (milMtdRes.data ?? []) as MileageRow[]
  const milYtd = (milYtdRes.data ?? []) as MileageRow[]

  function summarize(rows: InventoryRow[]) {
    const revenue = rows.reduce((a, r) => a + n(r.sold_price), 0)
    const netProfit = rows.reduce((a, r) => a + n(r.net_profit), 0)
    const sales = rows.length
    const margin = revenue > 0 ? (netProfit / revenue) : 0
    const fees = rows.reduce((a, r) => a + n(r.fees) + n(r.promoted_fees), 0)
    const shipping = rows.reduce((a, r) => a + n(r.shipping_cost), 0)
    return { revenue, netProfit, sales, margin, fees, shipping }
  }

  const categories: { name: string; revenue: number; sales: number }[] = (() => {
    const map = new Map<string, { revenue: number; sales: number }>()
    for (const r of invMtd) {
      const k = (r.category ?? 'uncategorized').trim() || 'uncategorized'
      const cur = map.get(k) ?? { revenue: 0, sales: 0 }
      cur.revenue += n(r.sold_price)
      cur.sales += 1
      map.set(k, cur)
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
  })()

  return Response.json({
    mtd: {
      ...summarize(invMtd),
      expenses: expMtd.reduce((a, r) => a + n(r.amount), 0),
      miles:    milMtd.reduce((a, r) => a + n(r.total_miles), 0),
    },
    ytd: {
      ...summarize(invYtd),
      expenses: expYtd.reduce((a, r) => a + n(r.amount), 0),
      miles:    milYtd.reduce((a, r) => a + n(r.total_miles), 0),
    },
    categories,
    last_sync: lastSyncRes.data?.[0]?.synced_at ?? null,
  })
}
