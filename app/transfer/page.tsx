'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TransferPage() {
  const [toEmail, setToEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Convert pounds to cents (e.g., 10.50 -> 1050)
    const amountCents = Math.round(parseFloat(amount) * 100)
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError('Enter a valid amount')
      return
    }

    const res = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, amountCents, note }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl text-gray-900 font-semibold">Payment Sent</h1>
          <p className="text-gray-500 text-sm">Redirecting you to your dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 space-y-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl text-gray-900 font-semibold">Send Payment</h1>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">Cancel</Link>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
            <input
              type="email"
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 text-gray-900 p-3 outline-none focus:ring-2 focus:ring-[#0068BE] focus:border-transparent"
              placeholder="recipient@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (GBP)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">£</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 text-gray-900 p-3 pl-8 outline-none focus:ring-2 focus:ring-[#0068BE] focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full rounded-lg border border-gray-300 text-gray-900 p-3 outline-none focus:ring-2 focus:ring-[#0068BE] focus:border-transparent"
              placeholder="e.g., Invoice payment"
            />
          </div>
          
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          
          <button
            type="submit"
            className="w-full rounded-lg bg-[#0068BE] text-white p-3 font-medium hover:bg-[#005a9e] transition mt-2"
          >
            Confirm Payment
          </button>
        </form>
      </div>
    </main>
  )
}