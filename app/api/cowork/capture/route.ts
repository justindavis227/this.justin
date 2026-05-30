import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { CaptureClassification, TaskTier } from '@/lib/types'

// Cowork capture endpoint — same pipeline as /api/capture.
// Documented separately for clarity; accepts x-api-secret header or Bearer token.

const CLASSIFIER_PROMPT = `You are a personal assistant for Justin Davis — Youth Pastor, reseller, and tool builder.
His spaces: students, southeast (church), family, finance, journal, health, resell, build.

Given a raw capture, classify it and return ONLY valid JSON, no prose:
{
  "kind": "task" | "note" | "idea" | "habit" | "journal",
  "space_slug": "<one of the spaces above or null if unclear>",
  "urgency": "now" | "soon" | "later" | "someday",
  "tags": ["string"],
  "summary": "one sentence, status-first, no filler"
}`

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const db = supabaseAdmin()
  const body = await req.json()
  const rawText: string = body.text ?? ''

  if (!rawText.trim()) {
    return Response.json({ error: 'text is required' }, { status: 400 })
  }

  let classification: CaptureClassification
  let llmSource = 'claude'

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 256,
      messages: [{ role: 'user', content: `${CLASSIFIER_PROMPT}\n\nCapture: "${rawText}"` }],
    })
    const content = msg.content[0]
    if (content.type !== 'text') throw new Error('unexpected')
    const json = content.text.match(/\{[\s\S]*\}/)?.[0]
    if (!json) throw new Error('no JSON')
    classification = JSON.parse(json) as CaptureClassification
  } catch {
    llmSource = 'fallback'
    classification = {
      kind: 'note', space_slug: null, urgency: 'later', tags: [], summary: rawText.slice(0, 120),
    }
  }

  const { data: capture } = await db
    .from('captures')
    .insert({ source: 'cowork', raw_text: rawText, classification, llm_source: llmSource })
    .select()
    .single()

  let routedTo: string | null = null
  let routedId: string | null = null

  if (capture) {
    if (classification.kind === 'task') {
      const { data: task } = await db
        .from('tasks')
        .insert({
          title: classification.summary,
          description: rawText,
          space_slug: classification.space_slug,
          tier: (classification.urgency as TaskTier) ?? 'later',
          tags: classification.tags,
        })
        .select().single()
      if (task) { routedTo = 'tasks'; routedId = task.id }
    } else {
      const { data: note } = await db
        .from('notes')
        .insert({ body: rawText, space_slug: classification.space_slug, tags: classification.tags })
        .select().single()
      if (note) { routedTo = 'notes'; routedId = note.id }
    }
    if (routedId) {
      await db.from('captures').update({ routed_to: routedTo, routed_id: routedId }).eq('id', capture.id)
    }
  }

  return Response.json({
    success: true,
    routed_to: routedTo,
    summary: classification.summary,
    kind: classification.kind,
  })
}
