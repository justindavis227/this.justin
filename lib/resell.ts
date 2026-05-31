import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

const SHEET_ID = process.env.RESELL_SHEET_ID ?? '1Q2jb8WcgvVDj51ar7QHjRbyl4vDKjLz1RTcOssHQDDE'

function sheetUrl(tab: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`
}

// Minimal RFC-4180-ish CSV parser. Handles quoted fields, escaped quotes, CRLF.
export function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        inQuotes = false; i++
      } else {
        field += c; i++
      }
    } else {
      if (c === '"') { inQuotes = true; i++ }
      else if (c === ',') { row.push(field); field = ''; i++ }
      else if (c === '\r') { i++ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++ }
      else { field += c; i++ }
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(c => c.trim() !== ''))
}

export function parseMoney(s: string | undefined | null): number | null {
  if (s === undefined || s === null) return null
  const cleaned = String(s).replace(/[$,\s]/g, '').trim()
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export function parseDate(s: string | undefined | null): string | null {
  if (!s) return null
  const t = String(s).trim()
  if (!t) return null
  // M/D/YYYY or MM/DD/YYYY
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    let [, mm, dd, yy] = m
    if (yy.length === 2) yy = (Number(yy) > 50 ? '19' : '20') + yy
    return `${yy.padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  }
  // YYYY-MM-DD passthrough
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  return null
}

export function parseInt32(s: string | undefined | null): number | null {
  if (s === undefined || s === null) return null
  const cleaned = String(s).replace(/[,\s]/g, '').trim()
  if (!cleaned) return null
  const n = parseInt(cleaned, 10)
  return Number.isFinite(n) ? n : null
}

function extKey(parts: (string | number | null | undefined)[]): string {
  const joined = parts.map(p => (p ?? '').toString().trim().toLowerCase()).join('|')
  return createHash('sha1').update(joined).digest('hex')
}

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return []
  const headers = rows[0].map(h => h.trim())
  return rows.slice(1).map(r => {
    const o: Record<string, string> = {}
    headers.forEach((h, i) => { o[h] = (r[i] ?? '').trim() })
    return o
  })
}

async function fetchTab(tab: string): Promise<Record<string, string>[]> {
  const res = await fetch(sheetUrl(tab), { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch tab "${tab}": HTTP ${res.status}`)
  const text = await res.text()
  return rowsToObjects(parseCSV(text))
}

interface SyncResult {
  inventory: number
  expenses: number
  mileage: number
}

export async function syncResell(): Promise<SyncResult> {
  const db = supabaseAdmin()

  const [invRows, expRows, milRows] = await Promise.all([
    fetchTab('Inventory'),
    fetchTab('Expense Log'),
    fetchTab('Mileage Log'),
  ])

  // --- Inventory ---
  const inventory = invRows
    .map(r => {
      const description = r['Item Description']
      const purchase_date = parseDate(r['Purchase Date'])
      if (!description || !description.trim()) return null
      return {
        ext_key: extKey([description, purchase_date, r['Cost of Goods'], r['Category']]),
        description: description.trim(),
        purchase_date,
        purchase_location:   r['Purchase Location']     || null,
        cost_of_goods:       parseMoney(r['Cost of Goods']),
        category:            r['Category']              || null,
        special_designation: r['Special Designation']   || null,
        date_listed:         parseDate(r['Date Listed']),
        days_active:         parseInt32(r['Days Active']),
        item_type:           r['Item Type']             || null,
        date_sold:           parseDate(r['Date Sold']),
        sold_price:          parseMoney(r['Sold Price']),
        platform_sold:       r['Platform Sold']         || null,
        fees:                parseMoney(r['Fees']),
        promoted_fees:       parseMoney(r['Promoted Fees']),
        shipping_provider:   r['Shipping Provider']     || null,
        shipping_cost:       parseMoney(r['Shipping Cost']),
        net_profit:          parseMoney(r['Net Profit']),
        adjusted_net_profit: parseMoney(r['Adjusted Net Profit']),
        raw:                 r,
        synced_at:           new Date().toISOString(),
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  // --- Expenses ---
  const expenses = expRows
    .map(r => {
      const description = r['Expense Description']
      const expense_date = parseDate(r['Date'])
      const amount = parseMoney(r['Amount'])
      if (!description || !description.trim()) return null
      return {
        ext_key: extKey([description, expense_date, amount]),
        description: description.trim(),
        expense_date,
        amount,
        notes: r['Notes'] || null,
        raw: r,
        synced_at: new Date().toISOString(),
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  // --- Mileage ---
  const mileage = milRows
    .map(r => {
      const log_date = parseDate(r['Date'])
      const purpose = r['Purpose']
      const total_miles = parseMoney(r['Total Miles']) // accepts plain numbers too
      if (!log_date && !purpose) return null
      return {
        ext_key: extKey([log_date, purpose, total_miles]),
        log_date,
        purpose: purpose || null,
        total_miles,
        notes: r['Notes'] || null,
        raw: r,
        synced_at: new Date().toISOString(),
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  // De-dup within batch (same ext_key collides)
  const dedup = <T extends { ext_key: string }>(rows: T[]): T[] =>
    Object.values(rows.reduce<Record<string, T>>((acc, r) => { acc[r.ext_key] = r; return acc }, {}))

  const invDeduped = dedup(inventory)
  const expDeduped = dedup(expenses)
  const milDeduped = dedup(mileage)

  if (invDeduped.length) {
    const { error } = await db.from('resell_inventory').upsert(invDeduped, { onConflict: 'ext_key' })
    if (error) throw new Error(`inventory upsert: ${error.message}`)
  }
  if (expDeduped.length) {
    const { error } = await db.from('resell_expenses').upsert(expDeduped, { onConflict: 'ext_key' })
    if (error) throw new Error(`expenses upsert: ${error.message}`)
  }
  if (milDeduped.length) {
    const { error } = await db.from('resell_mileage').upsert(milDeduped, { onConflict: 'ext_key' })
    if (error) throw new Error(`mileage upsert: ${error.message}`)
  }

  return {
    inventory: invDeduped.length,
    expenses:  expDeduped.length,
    mileage:   milDeduped.length,
  }
}
