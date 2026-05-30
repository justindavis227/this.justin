import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const { id } = await params
  const db = supabaseAdmin()
  const body = await req.json()

  const { data: goal, error } = await db
    .from('goals')
    .update({ done: body.done, text: body.text })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ goal })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const { id } = await params
  const db = supabaseAdmin()
  const { error } = await db.from('goals').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
