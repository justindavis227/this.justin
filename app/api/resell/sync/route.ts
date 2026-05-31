import { NextRequest } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'
import { syncResell } from '@/lib/resell'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try { await requireAuth(req) } catch { return unauthorizedResponse() }

  try {
    const counts = await syncResell()
    return Response.json({ ok: true, counts })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'sync failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
