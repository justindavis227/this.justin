import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { signSession, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return Response.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await signSession()
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })

  return Response.json({ ok: true })
}
