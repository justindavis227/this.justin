import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const { id } = await params
  const db = supabaseAdmin()
  const body = await req.json()

  const allowed = ['title', 'description', 'tier', 'space_slug', 'tags', 'due_date', 'is_key', 'priority_score', 'completed_at']
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of allowed) {
    if (k in body) patch[k] = body[k]
  }

  const { data: task, error } = await db
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ task })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const { id } = await params
  const db = supabaseAdmin()
  const { error } = await db.from('tasks').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
