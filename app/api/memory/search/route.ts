import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const body = await req.json()
  const query = (body.query as string | undefined)?.trim()
  const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 30)
  const space = (body.space as string | undefined) ?? null

  if (!query) {
    return Response.json({ error: 'query required' }, { status: 400 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const emb = await openai.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    input: query,
  })

  const db = supabaseAdmin()
  const { data, error } = await db.rpc('match_memory_chunks', {
    query_embedding: emb.data[0].embedding,
    match_count: limit,
    filter_space: space,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ query, results: data ?? [] })
}
