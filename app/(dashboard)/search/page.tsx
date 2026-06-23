'use client'

import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'

interface Result {
  app: string
  table: string
  id: string
  name: string | null
  email: string | null
  phone: string | null
  createdAt: string | null
}

const APP_COLORS: Record<string, string> = {
  sparkle: 'bg-purple-100 text-purple-700',
  brushbuddy: 'bg-blue-100 text-blue-700',
  team: 'bg-green-100 text-green-700',
  kammanest: 'bg-amber-100 text-amber-700',
  meditrack: 'bg-red-100 text-red-700',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' })
      const data = await res.json()
      setResults(data.results ?? [])
      setCount(data.count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') doSearch(query)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cross-app User Search</h1>
        <p className="text-xs text-gray-400">Search by name, email, or phone across all apps</p>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search name / email / phone…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#26408B] focus:border-transparent"
          />
        </div>
        <button
          onClick={() => doSearch(query)}
          disabled={loading || query.trim().length < 2}
          className="px-4 py-2.5 bg-[#26408B] text-white text-sm font-semibold rounded-lg hover:bg-[#1a2d63] transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {results !== null && (
        <div>
          <p className="text-xs text-gray-400 mb-3">{count} result{count !== 1 ? 's' : ''} across all apps</p>

          {results.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm text-center">
              <p className="text-sm text-gray-500">No users found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 font-semibold">App</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Name</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Email</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Phone</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={`${r.app}-${r.id}-${i}`} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${APP_COLORS[r.app] ?? 'bg-gray-100 text-gray-600'}`}>
                          {r.app}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{r.name ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{r.email ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{r.phone ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
