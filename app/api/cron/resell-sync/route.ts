import { NextRequest } from 'next/server'
import { syncResell } from '@/lib/resell'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const counts = await syncResell()
    return Response.json({ ok: true, counts })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'sync failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
