'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-white rounded-xl p-8 space-y-4 border border-gray-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-2">
            <span className="text-xl">✓</span>
          </div>
          <h1 className="text-xl text-gray-900 font-semibold">Registration successful</h1>
          <p className="text-gray-600 text-sm">
            Your verification link was printed in the Codespace terminal. Copy it, open it in your browser, then <Link href="/" className="text-[#0068BE] font-medium hover:underline">log in</Link>.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 space-y-6 border border-gray-200 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl text-gray-900 font-semibold">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your details to open a demo account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 text-gray-900 p-3 outline-none focus:ring-2 focus:ring-[#0068BE] focus:border-transparent"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 text-gray-900 p-3 outline-none focus:ring-2 focus:ring-[#0068BE] focus:border-transparent"
              placeholder="jane@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 text-gray-900 p-3 outline-none focus:ring-2 focus:ring-[#0068BE] focus:border-transparent"
              placeholder="Minimum 8 characters"
            />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#0068BE] text-white p-3 font-medium hover:bg-[#005a9e] transition"
          >
            Create account
          </button>
        </form>
        
        <p className="text-gray-500 text-sm text-center">
          Already have an account? <Link href="/" className="text-[#0068BE] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}