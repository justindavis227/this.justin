import { supabaseAdmin } from '@/lib/supabase'
import { Project } from '@/lib/types'
import ProjectsClient from '@/components/projects/ProjectsClient'

export const revalidate = 60

async function getProjects(): Promise<Project[]> {
  const db = supabaseAdmin()
  const { data } = await db
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  return (data ?? []) as Project[]
}

export default async function ProjectsPage() {
  const projects = await getProjects().catch(() => [] as Project[])
  return <ProjectsClient projects={projects} />
}
