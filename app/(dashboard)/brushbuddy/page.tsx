'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshButton } from '@/components/RefreshButton'
import { ConfirmAction } from '@/components/ConfirmAction'
import { Star } from 'lucide-react'

interface Pro { id: string; name: string; service_type: string; is_featured: boolean; rating: number | null; created_at: string }
interface Booking { id: string; status: string; created_at: string }
interface Data { userCount: number; pros: Pro[]; recentBookings: Booking[] }

export default function BrushBuddyPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/apps/brushbuddy', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleFeature(proId: string, featured: boolean) {
    const res = await fetch('/api/apps/brushbuddy/feature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proId, featured }),
    })
    if (!res.ok) throw new Error((await res.json()).error)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">BrushBuddy</h1>
          <p className="text-xs text-gray-400">Home services marketplace</p>
        </div>
        <RefreshButton onRefresh={load} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Users" value={data?.userCount ?? '…'} />
        <Stat label="Pros" value={data?.pros.length ?? '…'} />
        <Stat label="Recent Bookings" value={data?.recentBookings.length ?? '…'} />
      </div>

      {loading && !data && <Skeleton />}

      {data && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Pros</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-semibold">Name</th>
                  <th className="text-left pb-2 font-semibold">Service</th>
                  <th className="text-left pb-2 font-semibold">Rating</th>
                  <th className="text-left pb-2 font-semibold">Featured</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {data.pros.map((pro) => (
                  <tr key={pro.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-medium text-gray-900">{pro.name}</td>
                    <td className="py-2 text-gray-500 text-xs">{pro.service_type ?? '—'}</td>
                    <td className="py-2">
                      {pro.rating != null ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Star size={11} fill="currentColor" />{pro.rating.toFixed(1)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-2">
                      {pro.is_featured && (
                        <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <ConfirmAction
                        label={pro.is_featured ? 'Remove feature' : 'Feature this pro'}
                        description={`${pro.is_featured ? 'Remove feature badge from' : 'Feature'} "${pro.name}" in the app. This will be audit-logged.`}
                        onConfirm={() => toggleFeature(pro.id, !pro.is_featured)}
                        variant={pro.is_featured ? 'danger' : 'primary'}
                        buttonLabel={pro.is_featured ? 'Unfeature' : 'Feature'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Bookings</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-semibold">ID</th>
                  <th className="text-left pb-2 font-semibold">Status</th>
                  <th className="text-left pb-2 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-1.5 text-gray-400 text-xs font-mono">{b.id.slice(0, 8)}…</td>
                    <td className="py-1.5">
                      <span className={`text-xs font-semibold ${b.status === 'completed' ? 'text-green-600' : b.status === 'cancelled' ? 'text-red-500' : 'text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-1.5 text-gray-400 text-xs">{new Date(b.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#26408B]">{value}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-xl h-40 animate-pulse border border-gray-100" />)}
    </div>
  )
}
