import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/crypto'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function POST(req: Request) {
  const { email, password, fullName } = await req.json()
  
  // Get the Cloudflare context to access bindings
  const { env } = await getCloudflareContext({ async: true })
  const db = env.DB

  if (!db) {
    return NextResponse.json({ error: 'Database binding not found.' }, { status: 500 })
  }

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
  }

  const hash = await hashPassword(password)
  const userId = crypto.randomUUID()
  const accountId = crypto.randomUUID()
  const token = crypto.randomUUID()

  try {
    await db.batch([
      db.prepare('INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)')
        .bind(userId, email, hash, fullName || ''),
      db.prepare('INSERT INTO accounts (id, user_id, account_number) VALUES (?, ?, ?)')
        .bind(accountId, userId, 'ACC' + Math.floor(Math.random() * 1000000000)),
      db.prepare('INSERT INTO verification_tokens (token, user_id, expires_at) VALUES (?, ?, datetime("now", "+1 day"))')
        .bind(token, userId)
    ])

    console.log(`\n>>> VERIFY LINK: http://localhost:3000/verify?token=${token}\n`)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}