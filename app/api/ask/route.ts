import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export const maxDuration = 60

interface MatchRow {
  id: string
  source_type: string
  source_id: string | null
  space_slug: string | null
  text: string
  created_at: string
  similarity: number
}

const ASK_PROMPT = `You are Justin Davis's personal assistant inside This✱Justin Console. Justin is a Youth Pastor at Southeast Christian Church (Louisville, KY), a reseller, and a tool builder.

You'll be given Justin's question and a set of relevant chunks from his personal memory store — captures, notes, tasks, journal entries. Synthesize a direct, concise answer grounded in the chunks. Quote or paraphrase the chunks when useful.

Rules:
- Be terse. No padding. No "Based on the provided context…" preamble.
- Cite chunks inline like [1], [2] referring to their order below.
- If the chunks don't contain enough to answer, say so explicitly — don't make things up.
- Use markdown sparingly: bullets only when they add clarity.`

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const body = await req.json()
  const query = (body.query as string | undefined)?.trim()
  const limit = Math.min(Math.max(Number(body.limit) || 8, 1), 20)
  const space = (body.space as string | undefined) ?? null

  if (!query) return Response.json({ error: 'query required' }, { status: 400 })

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const emb = await openai.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    input: query,
  })

  const db = supabaseAdmin()
  const { data: matches, error } = await db.rpc('match_memory_chunks', {
    query_embedding: emb.data[0].embedding,
    match_count: limit,
    filter_space: space,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const rows = (matches ?? []) as MatchRow[]

  if (rows.length === 0) {
    return Response.json({
      query,
      answer: "I don't have anything in memory yet that's relevant to that question.",
      sources: [],
    })
  }

  const chunkBlock = rows
    .map((r, i) => `[${i + 1}] (${r.source_type}${r.space_slug ? ` · ${r.space_slug}` : ''} · ${r.created_at.slice(0, 10)})\n${r.text}`)
    .join('\n\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [
      {
        role: 'user',
        content: `${ASK_PROMPT}\n\nQuestion: ${query}\n\nMemory chunks:\n${chunkBlock}`,
      },
    ],
  })

  const content = msg.content[0]
  const answer = content.type === 'text' ? content.text : ''

  return Response.json({
    query,
    answer,
    sources: rows.map((r, i) => ({
      idx: i + 1,
      source_type: r.source_type,
      source_id: r.source_id,
      space_slug: r.space_slug,
      created_at: r.created_at,
      similarity: r.similarity,
      preview: r.text.slice(0, 200),
    })),
  })
}
