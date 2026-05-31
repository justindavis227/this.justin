import { supabaseAdmin } from '@/lib/supabase'
import SettingsClient from '@/components/settings/SettingsClient'

export const revalidate = 30

interface ActivityRow {
  id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

async function getActivity(): Promise<ActivityRow[]> {
  const db = supabaseAdmin()
  const { data } = await db
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(40)
  return (data ?? []) as ActivityRow[]
}

export default async function SettingsPage() {
  const activity = await getActivity().catch(() => [] as ActivityRow[])
  return <SettingsClient activity={activity} />
}
