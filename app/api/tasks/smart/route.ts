import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  const { query } = await req.json()
  if (!query?.trim()) return Response.json({ ids: [], note: 'No query provided.' })

  const db = supabaseAdmin()
  const { data: tasks } = await db
    .from('tasks')
    .select('id, title, tier, space_slug, tags')
    .is('completed_at', null)

  const slim = (tasks ?? []).map(t => ({
    id: t.id, title: t.title, tier: t.tier, space: t.space_slug,
  }))

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `You triage a weekly task list. Given the user query and tasks (JSON), return ONLY a JSON array of matching task ids, most relevant first. No prose.\n\nTASKS:\n${JSON.stringify(slim)}\n\nQUERY: "${query}"\n\nRespond with a JSON array like ["id1","id2"].`,
      }],
    })
    const content = msg.content[0]
    if (content.type !== 'text') throw new Error('unexpected')
    const match = content.text.match(/\[[\s\S]*?\]/)
    const ids: string[] = match ? JSON.parse(match[0]) : []
    return Response.json({ ids, note: `Claude matched ${ids.length} task${ids.length !== 1 ? 's' : ''}.` })
  } catch {
    return Response.json({ ids: [], note: 'Claude unavailable — try the Category tab.' })
  }
}
