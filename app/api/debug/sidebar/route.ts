// Diagnostic endpoint — hit /api/debug/sidebar in a browser to see exactly
// why the Sidebar's DB fetch is/isn't working. Doesn't return secret values,
// just presence checks + the actual query result or error.

import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const env = {
    NEXT_PUBLIC_SUPABASE_URL:    !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY:   !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) ?? null,
    service_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
  }

  let fetchResult: {
    ok: boolean
    error: string | null
    row_count: number
    rows: unknown[]
    threw: string | null
  } = { ok: false, error: null, row_count: 0, rows: [], threw: null }

  try {
    // Import inside the handler so a missing env var doesn't blow up the route's module load.
    const { supabaseAdmin } = await import('@/lib/supabase')
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('spaces')
      .select('slug, label, parent_slug, sort_order, icon, hidden, attn')
      .order('parent_slug', { ascending: true, nullsFirst: true })
      .order('sort_order',  { ascending: true })
    fetchResult = {
      ok: !error,
      error: error?.message ?? null,
      row_count: data?.length ?? 0,
      rows: data ?? [],
      threw: null,
    }
  } catch (e) {
    fetchResult.threw = e instanceof Error ? e.message : String(e)
  }

  const diagnosis = (() => {
    if (!env.SUPABASE_SERVICE_ROLE_KEY) return 'MISSING SERVICE ROLE KEY — set SUPABASE_SERVICE_ROLE_KEY in Vercel → Project Settings → Environment Variables, then redeploy.'
    if (!env.NEXT_PUBLIC_SUPABASE_URL)  return 'MISSING SUPABASE URL — set NEXT_PUBLIC_SUPABASE_URL in Vercel.'
    if (fetchResult.threw)              return `SUPABASE CLIENT THREW — ${fetchResult.threw}`
    if (fetchResult.error)              return `SUPABASE QUERY ERROR — ${fetchResult.error} (this could be RLS — service role should bypass it; verify the key is the service_role key, not anon)`
    if (fetchResult.row_count === 0)    return 'QUERY RETURNED 0 ROWS — table is empty or RLS is somehow blocking. Sidebar will use the hardcoded fallback.'
    return `OK — ${fetchResult.row_count} rows returned. Sidebar should render from DB.`
  })()

  return Response.json({
    env,
    fetch: fetchResult,
    diagnosis,
    note: 'This endpoint is auth-gated (cookie or x-api-secret). Boolean env flags only — no secret values are exposed.',
  }, { status: 200 })
}
