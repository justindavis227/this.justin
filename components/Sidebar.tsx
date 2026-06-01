// Server component — resolves the spaces list once (DB via service-role,
// falling back to a hardcoded array if DB is empty or errors) and hands
// the resolved array to SidebarClient. The client never makes its own
// fallback decision, so server-rendered HTML and client-hydrated output
// are always derived from the same input → no hydration mismatch.

import { supabaseAdmin } from '@/lib/supabase'
import SidebarClient, { DbSpace } from './SidebarClient'

// Used only when the DB call fails or returns zero rows.
const HARDCODED_FALLBACK_SPACES: DbSpace[] = [
  { slug: 'work',      label: 'Work',      icon: 'Briefcase',     parent_slug: null,       sort_order: 1, hidden: false, attn: false },
  { slug: 'southeast', label: 'Southeast', icon: 'MapPin',        parent_slug: 'work',     sort_order: 1, hidden: false, attn: false },
  { slug: 'students',  label: 'Students',  icon: 'GraduationCap', parent_slug: 'work',     sort_order: 2, hidden: false, attn: true  },
  { slug: 'personal',  label: 'Personal',  icon: 'User',          parent_slug: null,       sort_order: 2, hidden: false, attn: false },
  { slug: 'family',    label: 'Family',    icon: 'Users',         parent_slug: 'personal', sort_order: 1, hidden: false, attn: false },
  { slug: 'finance',   label: 'Finance',   icon: 'Wallet',        parent_slug: 'personal', sort_order: 2, hidden: false, attn: false },
  { slug: 'journal',   label: 'Journal',   icon: 'BookOpen',      parent_slug: 'personal', sort_order: 3, hidden: false, attn: false },
  { slug: 'health',    label: 'Health',    icon: 'Heart',         parent_slug: 'personal', sort_order: 4, hidden: false, attn: false },
  { slug: 'resell',    label: 'Resell',    icon: 'Tags',          parent_slug: null,       sort_order: 3, hidden: false, attn: false },
  { slug: 'listings',  label: 'Listings',  icon: 'Tag',           parent_slug: 'resell',   sort_order: 1, hidden: false, attn: false },
  { slug: 'build',     label: 'Build',     icon: 'Hammer',        parent_slug: null,       sort_order: 4, hidden: false, attn: false },
]

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
      return HARDCODED_FALLBACK_SPACES
    }
    if (!data || data.length === 0) {
      console.error('[Sidebar] spaces query returned 0 rows — table may be empty or RLS is blocking the service role; using hardcoded fallback')
      return HARDCODED_FALLBACK_SPACES
    }
    return data as DbSpace[]
  } catch (e) {
    console.error('[Sidebar] threw while loading spaces:', e instanceof Error ? e.message : e)
    return HARDCODED_FALLBACK_SPACES
  }
}

export default async function Sidebar() {
  const spaces = await loadSpaces()
  return <SidebarClient spaces={spaces} />
}
