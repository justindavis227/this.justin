import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const db = supabaseAdmin()
  const { data, error } = await db.from('goals').select('*').order('created_at')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ goals: data })
}

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const db = supabaseAdmin()
  const body = await req.json()

  const { data: goal, error } = await db
    .from('goals')
    .insert({ scope: body.scope ?? 'annual', text: body.text, done: false })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ goal }, { status: 201 })
}
