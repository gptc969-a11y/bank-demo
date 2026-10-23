import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readSession } from '@/lib/session'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function POST(req: Request) {
  // 1. Check who is making the request
  const token = (await cookies()).get('session')?.value
  const userId = token ? await readSession(token) : null
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { toEmail, amountCents, note } = await req.json()
  const { env } = await getCloudflareContext({ async: true })
  const db = env.DB

  if (!db) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  // 2. Get sender and receiver accounts
  const sender = await db.prepare('SELECT id, balance_cents FROM accounts WHERE user_id = ?').bind(userId).first() as any
  const receiver = await db.prepare(`
    SELECT accounts.id FROM accounts 
    JOIN users ON users.id = accounts.user_id 
    WHERE users.email = ?
  `).bind(toEmail).first() as any

  if (!sender) return NextResponse.json({ error: 'Sender account not found' }, { status: 404 })
  if (!receiver) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
  if (receiver.id === sender.id) return NextResponse.json({ error: "You can't send money to yourself" }, { status: 400 })
  if (sender.balance_cents < amountCents) return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 })

  // 3. Execute the transfer atomically using db.batch()
  try {
    await db.batch([
      // Deduct from sender (the 'balance_cents >= ?' acts as a safety check)
      db.prepare('UPDATE accounts SET balance_cents = balance_cents - ? WHERE id = ? AND balance_cents >= ?')
        .bind(amountCents, sender.id, amountCents),
      // Add to receiver
      db.prepare('UPDATE accounts SET balance_cents = balance_cents + ? WHERE id = ?')
        .bind(amountCents, receiver.id),
      // Log the transaction
      db.prepare('INSERT INTO transactions (id, from_account_id, to_account_id, amount_cents, note) VALUES (?, ?, ?, ?, ?)')
        .bind(crypto.randomUUID(), sender.id, receiver.id, amountCents, note || '')
    ])
    
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Transfer failed: ' + err.message }, { status: 500 })
  }
}