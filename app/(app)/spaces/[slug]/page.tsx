import { supabaseAdmin } from '@/lib/supabase'
import GenericSpaceDashboard from '@/components/spaces/GenericSpaceDashboard'
import ResellDashboard from '@/components/spaces/ResellDashboard'

export const revalidate = 60

export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const db = supabaseAdmin()
  const { data: space } = await db.from('spaces').select('slug, label').eq('slug', slug).maybeSingle()

  const label = space?.label ?? slug.charAt(0).toUpperCase() + slug.slice(1)

  if (slug === 'resell') {
    return <ResellDashboard />
  }

  return <GenericSpaceDashboard slug={slug} label={label} />
}
