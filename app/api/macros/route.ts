import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { format } from 'date-fns'

export const maxDuration = 30

const MACRO_PROMPT = `You are a nutrition estimator. Given a plain-language meal description, return ONLY valid JSON, no prose:
{
  "calories": <int kcal>,
  "protein_g": <int grams>,
  "carbs_g": <int grams>,
  "fat_g": <int grams>,
  "items": [{ "name": "...", "qty": "..." }]
}

Rules:
- Be realistic. If the description is vague, use typical serving sizes.
- Integer values, rounded to nearest gram/kcal.
- If something is uncertain, estimate conservatively and reflect it in items[].`

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const body = await req.json()
  const description = (body.description as string | undefined)?.trim()
  const date = (body.date as string | undefined) ?? format(new Date(), 'yyyy-MM-dd')

  if (!description) {
    return Response.json({ error: 'description required' }, { status: 400 })
  }

  let calories: number | null = null
  let protein_g: number | null = null
  let carbs_g: number | null = null
  let fat_g: number | null = null
  let raw: Record<string, unknown> | null = null
  let llmSource = 'claude'

  // Allow client to override estimation with explicit values
  if (typeof body.calories === 'number') calories = Math.round(body.calories)
  if (typeof body.protein_g === 'number') protein_g = Math.round(body.protein_g)
  if (typeof body.carbs_g === 'number') carbs_g = Math.round(body.carbs_g)
  if (typeof body.fat_g === 'number') fat_g = Math.round(body.fat_g)

  const needsEstimate = calories === null && protein_g === null && carbs_g === null && fat_g === null

  if (needsEstimate) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const msg = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{ role: 'user', content: `${MACRO_PROMPT}\n\nMeal: "${description}"` }],
      })
      const content = msg.content[0]
      if (content.type !== 'text') throw new Error('unexpected response')
      const json = content.text.match(/\{[\s\S]*\}/)?.[0]
      if (!json) throw new Error('no JSON')
      raw = JSON.parse(json)
      const r = raw as Record<string, unknown>
      calories  = typeof r.calories  === 'number' ? Math.round(r.calories)  : null
      protein_g = typeof r.protein_g === 'number' ? Math.round(r.protein_g) : null
      carbs_g   = typeof r.carbs_g   === 'number' ? Math.round(r.carbs_g)   : null
      fat_g     = typeof r.fat_g     === 'number' ? Math.round(r.fat_g)     : null
    } catch {
      llmSource = 'fallback'
    }
  } else {
    llmSource = 'manual'
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('macro_entries')
    .insert({
      log_date: date,
      description,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      raw,
      llm_source: llmSource,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, entry: data })
}

export async function DELETE(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const db = supabaseAdmin()
  const { error } = await db.from('macro_entries').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}
