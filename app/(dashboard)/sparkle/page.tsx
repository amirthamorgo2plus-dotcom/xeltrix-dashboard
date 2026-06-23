'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshButton } from '@/components/RefreshButton'

interface Org {
  id: string
  name: string
  slug: string
  address: string | null
  storage_bytes: number | null
  last_login_at: string | null
  created_at: string
}
interface Event { id: string; status: string; created_at: string }
interface Data { orgs: Org[]; staffCount: number; recentEvents: Event[]; recentMaintenance: Event[] }

function fmtBytes(b: number | null) {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
}

export default function SparklePage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/apps/sparkle', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sparkle</h1>
          <p className="text-xs text-gray-400">Hotel housekeeping management</p>
        </div>
        <RefreshButton onRefresh={load} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Stat label="Hotels / Orgs" value={data?.orgs.length ?? '…'} />
        <Stat label="Staff" value={data?.staffCount ?? '…'} />
      </div>

      {loading && !data && <Skeleton />}

      {data && (
        <div className="space-y-4">
          <Section title={`Hotels (${data.orgs.length})`}>
            {data.orgs.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No hotels found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-2 font-semibold">Name</th>
                    <th className="text-left pb-2 font-semibold">Address</th>
                    <th className="text-left pb-2 font-semibold">Storage</th>
                    <th className="text-left pb-2 font-semibold">Last login</th>
                    <th className="text-left pb-2 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orgs.map((org) => (
                    <tr key={org.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 font-medium text-gray-900">
                        {org.name}
                        <span className="ml-1.5 text-[10px] text-gray-400 font-normal">{org.slug}</span>
                      </td>
                      <td className="py-2 text-gray-500 text-xs">{org.address ?? '—'}</td>
                      <td className="py-2 text-gray-600 text-xs font-mono">{fmtBytes(org.storage_bytes)}</td>
                      <td className="py-2 text-gray-400 text-xs">{fmtDate(org.last_login_at)}</td>
                      <td className="py-2 text-gray-400 text-xs">{fmtDate(org.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Section title="Recent Cleaning Events">
              {data.recentEvents.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">No events.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2 font-semibold">ID</th>
                      <th className="text-left pb-2 font-semibold">Status</th>
                      <th className="text-left pb-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.map((e) => (
                      <tr key={e.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-1.5 text-gray-400 text-xs font-mono">{e.id.slice(0, 8)}…</td>
                        <td className="py-1.5 text-xs font-semibold text-gray-700">{e.status}</td>
                        <td className="py-1.5 text-gray-400 text-xs">{fmtDate(e.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>

            <Section title="Recent Maintenance">
              {data.recentMaintenance.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">No maintenance records.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2 font-semibold">ID</th>
                      <th className="text-left pb-2 font-semibold">Status</th>
                      <th className="text-left pb-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentMaintenance.map((e) => (
                      <tr key={e.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-1.5 text-gray-400 text-xs font-mono">{e.id.slice(0, 8)}…</td>
                        <td className="py-1.5 text-xs font-semibold text-gray-700">{e.status}</td>
                        <td className="py-1.5 text-gray-400 text-xs">{fmtDate(e.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 h-20 animate-pulse" />
      ))}
    </div>
  )
}
