'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      router.replace('/overview')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Invalid password')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#26408B] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="7" height="7" rx="1.5" fill="white" />
              <rect x="10" y="1" width="7" height="7" rx="1.5" fill="white" opacity=".6" />
              <rect x="1" y="10" width="7" height="7" rx="1.5" fill="white" opacity=".6" />
              <rect x="10" y="10" width="7" height="7" rx="1.5" fill="white" opacity=".3" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#26408B] tracking-widest uppercase">Xeltrix</p>
            <p className="text-base font-bold text-gray-900 leading-tight">Command</p>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-1">Super-admin login</h1>
        <p className="text-sm text-gray-500 mb-6">Internal access only</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#26408B] focus:border-transparent"
              placeholder="Enter dashboard password"
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#26408B] hover:bg-[#1a2d63] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
