'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      return
    }
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 space-y-6 border border-gray-200 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#0068BE] rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-xl font-bold">CJ</span>
          </div>
          <h1 className="text-2xl text-gray-900 font-semibold">Sign in to your account</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 text-gray-900 p-3 outline-none focus:ring-2 focus:ring-[#0068BE] focus:border-transparent"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 text-gray-900 p-3 outline-none focus:ring-2 focus:ring-[#0068BE] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#0068BE] text-white p-3 font-medium hover:bg-[#005a9e] transition"
          >
            Sign in
          </button>
        </form>
        
        <p className="text-gray-500 text-sm text-center">
          Don't have an account? <Link href="/register" className="text-[#0068BE] font-medium hover:underline">Register</Link>
        </p>
      </div>
    </main>
  )
}