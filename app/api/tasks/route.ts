import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const db = supabaseAdmin()
  const { searchParams } = new URL(req.url)

  let query = db
    .from('tasks')
    .select('*')
    .is('completed_at', null)
    .order('priority_score', { ascending: false })
    .order('created_at', { ascending: false })

  const tier = searchParams.get('tier')
  if (tier) query = query.eq('tier', tier)

  const space = searchParams.get('space_slug')
  if (space) query = query.eq('space_slug', space)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ tasks: data })
}

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const db = supabaseAdmin()
  const body = await req.json()

  const { data: task, error } = await db
    .from('tasks')
    .insert({
      title: body.title,
      description: body.description ?? null,
      space_slug: body.space_slug ?? null,
      tier: body.tier ?? 'someday',
      tags: body.tags ?? [],
      due_date: body.due_date ?? null,
      is_key: body.is_key ?? false,
      priority_score: body.priority_score ?? 0,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ task }, { status: 201 })
}
