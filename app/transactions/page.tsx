import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readSession } from '@/lib/session'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import Link from 'next/link'

// Tell Next.js 16 not to statically cache this page
export const instant = false

export default async function TransactionsPage() {
  // 1. Verify session
  const token = (await cookies()).get('session')?.value
  const userId = token ? await readSession(token) : null
  if (!userId) redirect('/')

  // 2. Get DB and current user's account ID
  const { env } = await getCloudflareContext({ async: true })
  const db = env.DB

  const myAccount = await db.prepare('SELECT id FROM accounts WHERE user_id = ?').bind(userId).first() as any
  if (!myAccount) redirect('/')

  // 3. Fetch transactions where the user is either the sender OR the receiver
  const { results: transactions } = await db.prepare(`
    SELECT 
      t.id, 
      t.amount_cents, 
      t.note, 
      t.created_at,
      t.from_account_id,
      t.to_account_id,
      uf.email AS from_email,
      ut.email AS to_email
    FROM transactions t
    JOIN accounts af ON af.id = t.from_account_id
    JOIN users uf ON uf.id = af.user_id
    JOIN accounts at ON at.id = t.to_account_id
    JOIN users ut ON ut.id = at.user_id
    WHERE t.from_account_id = ? OR t.to_account_id = ?
    ORDER BY t.created_at DESC
  `).bind(myAccount.id, myAccount.id).all()

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-xl text-gray-900 font-semibold">Transaction History</h1>
          <Link href="/dashboard" className="text-sm text-[#0068BE] font-medium hover:underline">Back to Dashboard</Link>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx: any) => {
                const isOutgoing = tx.from_account_id === myAccount.id
                const amount = (tx.amount_cents / 100).toFixed(2)
                
                return (
                  <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      {/* Arrow Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOutgoing ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {isOutgoing ? '↗' : '↙'}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">
                          {isOutgoing ? `To ${tx.to_email}` : `From ${tx.from_email}`}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {tx.note || 'No reference'} · {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-mono font-semibold ${isOutgoing ? 'text-gray-900' : 'text-green-600'}`}>
                      {isOutgoing ? '-' : '+'}£{amount}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}