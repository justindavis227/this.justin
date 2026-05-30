import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

export const COOKIE_NAME = 'tj_session'

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET not configured')
  return new TextEncoder().encode(secret)
}

export async function signSession(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function requireAuth(req: NextRequest): Promise<void> {
  const apiSecret = process.env.API_SECRET

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ') && apiSecret) {
    if (authHeader.slice(7) === apiSecret) return
  }

  const xApiSecret = req.headers.get('x-api-secret')
  if (xApiSecret && apiSecret && xApiSecret === apiSecret) return

  const cookie = req.cookies.get(COOKIE_NAME)?.value
  if (cookie && (await verifySession(cookie))) return

  throw Object.assign(new Error('Unauthorized'), { status: 401 })
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
