import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('spaces')
    .select('*')
    .order('nav_group', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ spaces: data ?? [] })
}

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const body = await req.json()
  const slug = (body.slug as string | undefined)?.trim().toLowerCase()
  const label = (body.label as string | undefined)?.trim()

  if (!slug || !label) {
    return Response.json({ error: 'slug and label required' }, { status: 400 })
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return Response.json({ error: 'slug must be lowercase letters/digits/hyphens' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('spaces')
    .insert({
      slug,
      label,
      nav_group:   body.nav_group ?? null,
      icon:        body.icon ?? null,
      parent_slug: body.parent_slug ?? null,
      sort_order:  typeof body.sort_order === 'number' ? body.sort_order : 99,
      hidden:      body.hidden ?? false,
      attn:        body.attn ?? false,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ space: data })
}
