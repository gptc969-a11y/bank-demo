import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET(req: Request) {
  // 1. Get the token from the URL
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  // 2. Get the database
  const { env } = await getCloudflareContext({ async: true })
  const db = env.DB

  if (!token) {
    return NextResponse.redirect(new URL('/?error=bad-token', req.url))
  }

  // 3. Find the token in the database
  const row = await db.prepare(
    'SELECT user_id FROM verification_tokens WHERE token = ? AND expires_at > datetime("now")'
  ).bind(token).first() as { user_id: string } | null

  if (!row) {
    return NextResponse.redirect(new URL('/?error=token-expired', req.url))
  }

  // 4. Update the user and delete the token
  try {
    await db.batch([
      db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').bind(row.user_id),
      db.prepare('DELETE FROM verification_tokens WHERE token = ?').bind(token)
    ])
    
    // 5. Send them to the login page
    return NextResponse.redirect(new URL('/?verified=1', req.url))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}