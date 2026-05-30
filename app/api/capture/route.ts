import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { CaptureClassification, TaskTier } from '@/lib/types'

const CLASSIFIER_PROMPT = `You are a personal assistant for Justin Davis — Youth Pastor, reseller, and tool builder.
His spaces: students, southeast (church), family, finance, journal, health, resell, build.

Given a raw capture, classify it and return ONLY valid JSON, no prose:
{
  "kind": "task" | "note" | "idea" | "habit" | "journal",
  "space_slug": "<one of the spaces above or null if unclear>",
  "urgency": "now" | "soon" | "later" | "someday",
  "tags": ["string"],
  "summary": "one sentence, status-first, no filler"
}

Rules:
- If it sounds like something to DO → task
- If it's a thought, observation, or reference → note
- If it starts with "idea:" or is clearly a new concept → idea (routes to notes)
- If it's about a habit or health check → habit (routes to daily_logs)
- If it's reflective/personal → journal (routes to notes, space_slug = journal)
- urgency only matters for tasks; default other kinds to "later"`

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch {
    return unauthorizedResponse()
  }

  const db = supabaseAdmin()
  let rawText: string | null = null
  let audioUrl: string | null = null
  let source = 'web-form'

  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData()
    const audio = form.get('audio') as File | null
    const textField = form.get('text') as string | null
    source = 'shortcut-voice'

    if (audio) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const transcription = await openai.audio.transcriptions.create({
        file: audio,
        model: process.env.OPENAI_WHISPER_MODEL ?? 'whisper-1',
      })
      rawText = transcription.text
    } else if (textField) {
      rawText = textField
      source = 'shortcut-text'
    }
  } else {
    const body = await req.json()
    rawText = body.text ?? null
    source = body.source ?? 'web-form'
  }

  if (!rawText?.trim()) {
    return Response.json({ error: 'No text or audio provided' }, { status: 400 })
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
    if (content.type !== 'text') throw new Error('unexpected response')
    const json = content.text.match(/\{[\s\S]*\}/)?.[0]
    if (!json) throw new Error('no JSON in response')
    classification = JSON.parse(json) as CaptureClassification
  } catch {
    llmSource = 'fallback'
    classification = {
      kind: 'note',
      space_slug: null,
      urgency: 'later',
      tags: [],
      summary: rawText.slice(0, 120),
    }
  }

  const { data: capture, error: captureErr } = await db
    .from('captures')
    .insert({
      source,
      raw_text: rawText,
      audio_url: audioUrl,
      classification,
      llm_source: llmSource,
    })
    .select()
    .single()

  if (captureErr || !capture) {
    return Response.json({ error: 'Failed to save capture' }, { status: 500 })
  }

  let routedTo: string | null = null
  let routedId: string | null = null

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
      .select()
      .single()
    if (task) { routedTo = 'tasks'; routedId = task.id }
  } else {
    const { data: note } = await db
      .from('notes')
      .insert({
        body: rawText,
        space_slug: classification.space_slug ?? (classification.kind === 'journal' ? 'journal' : null),
        tags: classification.tags,
      })
      .select()
      .single()
    if (note) { routedTo = 'notes'; routedId = note.id }
  }

  if (routedId) {
    await db.from('captures').update({ routed_to: routedTo, routed_id: routedId }).eq('id', capture.id)
  }

  // Embed asynchronously (fire and forget)
  embedCapture(rawText, capture.id, classification.space_slug)

  await db.from('audit_log').insert({
    action: 'capture',
    resource_type: routedTo ?? 'captures',
    resource_id: routedId ?? capture.id,
    metadata: { source, kind: classification.kind, llm_source: llmSource },
  })

  return Response.json({
    success: true,
    routed_to: routedTo,
    summary: classification.summary,
    kind: classification.kind,
  })
}

async function embedCapture(text: string, captureId: string, spaceSl: string | null) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const emb = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
      input: text,
    })
    const db = supabaseAdmin()
    await db.from('memory_chunks').insert({
      source_type: 'capture',
      source_id: captureId,
      space_slug: spaceSl,
      text,
      embedding: emb.data[0].embedding,
    })
  } catch {
    // non-fatal
  }
}
