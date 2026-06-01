// Server component — fetches spaces directly via the Supabase service-role
// client (bypasses RLS) and hands them to SidebarClient. Doing this server-
// side means the first paint already has the right nav, no API round-trip,
// and no client-side fallback flash unless the DB call actually errored.

import { supabaseAdmin } from '@/lib/supabase'
import SidebarClient, { DbSpace } from './SidebarClient'

async function loadSpaces(): Promise<DbSpace[]> {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('spaces')
      .select('slug, label, icon, parent_slug, sort_order, hidden, attn')
      .order('parent_slug', { ascending: true, nullsFirst: true })
      .order('sort_order',  { ascending: true })

    if (error) {
      console.error('[Sidebar] Supabase error loading spaces:', error.message, error)
      return []
    }
    if (!data || data.length === 0) {
      console.error('[Sidebar] spaces query returned 0 rows — table may be empty or RLS is blocking the service role')
      return []
    }
    return data as DbSpace[]
  } catch (e) {
    console.error('[Sidebar] threw while loading spaces:', e instanceof Error ? e.message : e)
    return []
  }
}

export default async function Sidebar() {
  const spaces = await loadSpaces()
  return <SidebarClient initialSpaces={spaces} />
}
