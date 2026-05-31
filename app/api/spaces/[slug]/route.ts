import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

interface Ctx { params: Promise<{ slug: string }> }

const EDITABLE_FIELDS = ['label', 'nav_group', 'icon', 'parent_slug', 'sort_order', 'hidden', 'attn'] as const

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const { slug } = await params
  const body = await req.json()
  const patch: Record<string, unknown> = {}
  for (const f of EDITABLE_FIELDS) {
    if (f in body) patch[f] = body[f]
  }
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: 'no editable fields' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db.from('spaces').update(patch).eq('slug', slug).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ space: data })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try { await requireAuth(_req) } catch { return unauthorizedResponse() }

  const { slug } = await params
  const db = supabaseAdmin()
  const { error } = await db.from('spaces').delete().eq('slug', slug)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
