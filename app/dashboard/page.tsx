import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readSession } from '@/lib/session'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import Link from 'next/link'

export const instant = false

export default async function Dashboard() {
  const token = (await cookies()).get('session')?.value
  const userId = token ? await readSession(token) : null

  if (!userId) {
    redirect('/')
  }

  const { env } = await getCloudflareContext({ async: true })
  const db = env.DB

  const user = await db.prepare('SELECT full_name, email FROM users WHERE id = ?').bind(userId).first() as any
  const account = await db.prepare('SELECT account_number, balance_cents FROM accounts WHERE user_id = ?').bind(userId).first() as any

  if (!user || !account) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0068BE] rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">CJ</span>
            </div>
            <div>
              <p className="text-gray-900 font-semibold">{user.full_name || user.email}</p>
              <p className="text-gray-500 text-xs">{user.email}</p>
            </div>
          </div>
          <form action="/api/logout" method="POST">
            <button className="text-sm text-gray-500 hover:text-gray-800 font-medium">Sign out</button>
          </form>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Available Balance</p>
              <p className="text-4xl font-bold text-gray-900 mt-1 font-mono">
                £{(account.balance_cents / 100).toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-50 text-[#0068BE] px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
              GBP Account
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <p className="text-gray-500 text-xs">Account Number</p>
            <p className="text-gray-900 text-sm font-mono tracking-wider">{account.account_number}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/transfer" className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:border-[#0068BE] transition group">
            <p className="text-gray-900 font-semibold group-hover:text-[#0068BE]">Send Payment</p>
            <p className="text-gray-500 text-sm mt-1">Transfer funds to another account</p>
          </Link>
          <Link href="/transactions" className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:border-[#0068BE] transition group">
            <p className="text-gray-900 font-semibold group-hover:text-[#0068BE]">Transaction History</p>
            <p className="text-gray-500 text-sm mt-1">View your recent activity</p>
          </Link>
        </div>

        {/* Compliance Badge */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mt-8">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Secured by 256-bit encryption · FCA-regulated EMI (Demo)
        </div>

      </div>
    </main>
  )
}