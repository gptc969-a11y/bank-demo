import { NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/crypto'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode('super-secret-random-string-at-least-32-chars')

export async function POST(req: any) {
  const { email, password } = await req.json()
  const { env } = await getCloudflareContext({ async: true })
  const db = env.DB

  if (!db) return NextResponse.json({ error: 'DB error' }, { status: 500 })

  const user = await db.prepare('SELECT id, password_hash, email_verified FROM users WHERE email = ?').bind(email).first() as any

  if (!user) {
    return NextResponse.json({ error: 'Wrong email or password' }, { status: 401 })
  }

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return NextResponse.json({ error: 'Wrong email or password' }, { status: 401 })
  }

  if (user.email_verified !== 1) {
    return NextResponse.json({ error: 'Please verify your email first' }, { status: 403 })
  }

  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  
  return res
}