'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshButton } from '@/components/RefreshButton'

interface Org {
  id: string; name: string; slug: string
  address: string | null; storage_bytes: number | null
  last_login_at: string | null; created_at: string
}
interface Staff {
  id: string; name: string; role: string
  phone: string | null; language: string | null
  active: boolean; org_id: string; created_at: string
}
interface CleaningEvent {
  id: string; event: string; room_no: string | null
  cleaner_name: string | null; duration_secs: number | null; created_at: string
}
interface Maintenance {
  id: string; issue: string; category: string | null; status: string
  urgent: boolean; room_no: string | null; reported_name: string | null
  fixed_at: string | null; created_at: string
}
interface Data { orgs: Org[]; staff: Staff[]; recentEvents: CleaningEvent[]; recentMaintenance: Maintenance[] }

function fmtBytes(b: number | null) {
  if (!b) return '—'
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
  const [tab, setTab] = useState<'hotels' | 'staff' | 'events'>('hotels')

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

  const activeStaff = data?.staff.filter(s => s.active).length ?? 0
  const inactiveStaff = data?.staff.filter(s => !s.active).length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sparkle</h1>
          <p className="text-xs text-gray-400">Hotel housekeeping management</p>
        </div>
        <RefreshButton onRefresh={load} />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Hotels" value={data?.orgs.length ?? '…'} />
        <Stat label="Staff" value={data?.staff.length ?? '…'} />
        <Stat label="Active staff" value={activeStaff || '…'} color="text-green-600" />
        <Stat label="Inactive" value={inactiveStaff || '0'} color="text-gray-400" />
      </div>

      {loading && !data && <Skeleton />}

      {data && (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
            {(['hotels', 'staff', 'events'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                  tab === t ? 'bg-white text-[#26408B] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'events' ? 'Events & Maintenance' : t}
              </button>
            ))}
          </div>

          {/* Hotels tab */}
          {tab === 'hotels' && (
            <Section title={`Hotels (${data.orgs.length})`}>
              {data.orgs.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No hotels found.</p>
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
                          <span className="ml-1.5 text-[10px] text-gray-400">{org.slug}</span>
                        </td>
                        <td className="py-2 text-gray-500 text-xs">{org.address ?? '—'}</td>
                        <td className="py-2 text-xs font-mono text-gray-600">{fmtBytes(org.storage_bytes)}</td>
                        <td className="py-2 text-gray-400 text-xs">{fmtDate(org.last_login_at)}</td>
                        <td className="py-2 text-gray-400 text-xs">{fmtDate(org.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>
          )}

          {/* Staff tab */}
          {tab === 'staff' && (
            <Section title={`Staff (${data.staff.length})`}>
              {data.staff.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No staff found.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2 font-semibold">Name</th>
                      <th className="text-left pb-2 font-semibold">Role</th>
                      <th className="text-left pb-2 font-semibold">Phone</th>
                      <th className="text-left pb-2 font-semibold">Language</th>
                      <th className="text-left pb-2 font-semibold">Status</th>
                      <th className="text-left pb-2 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.staff.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 font-medium text-gray-900">{s.name}</td>
                        <td className="py-2 text-xs text-gray-500 capitalize">{s.role}</td>
                        <td className="py-2 text-xs text-gray-500">{s.phone ?? '—'}</td>
                        <td className="py-2 text-xs text-gray-500">{s.language ?? '—'}</td>
                        <td className="py-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {s.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2 text-gray-400 text-xs">{fmtDate(s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>
          )}

          {/* Events tab */}
          {tab === 'events' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Section title={`Cleaning Events (${data.recentEvents.length})`}>
                {data.recentEvents.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No events.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-gray-100">
                        <th className="text-left pb-2 font-semibold">Event</th>
                        <th className="text-left pb-2 font-semibold">Room</th>
                        <th className="text-left pb-2 font-semibold">Cleaner</th>
                        <th className="text-left pb-2 font-semibold">Duration</th>
                        <th className="text-left pb-2 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentEvents.map((e) => (
                        <tr key={e.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-1.5 text-xs font-semibold text-gray-700 capitalize">{e.event}</td>
                          <td className="py-1.5 text-xs text-gray-500">{e.room_no ?? '—'}</td>
                          <td className="py-1.5 text-xs text-gray-500">{e.cleaner_name ?? '—'}</td>
                          <td className="py-1.5 text-xs text-gray-500">
                            {e.duration_secs != null ? `${Math.round(e.duration_secs / 60)}m` : '—'}
                          </td>
                          <td className="py-1.5 text-gray-400 text-xs">{fmtDate(e.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Section>

              <Section title={`Maintenance (${data.recentMaintenance.length})`}>
                {data.recentMaintenance.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No maintenance records.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-gray-100">
                        <th className="text-left pb-2 font-semibold">Issue</th>
                        <th className="text-left pb-2 font-semibold">Room</th>
                        <th className="text-left pb-2 font-semibold">Reported by</th>
                        <th className="text-left pb-2 font-semibold">Status</th>
                        <th className="text-left pb-2 font-semibold">Fixed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentMaintenance.map((e) => (
                        <tr key={e.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-1.5 text-xs text-gray-800">
                            {e.urgent && <span className="mr-1 text-red-500 font-bold">!</span>}
                            {e.issue}
                            {e.category && <span className="ml-1 text-gray-400">({e.category})</span>}
                          </td>
                          <td className="py-1.5 text-xs text-gray-500">{e.room_no ?? '—'}</td>
                          <td className="py-1.5 text-xs text-gray-500">{e.reported_name ?? '—'}</td>
                          <td className="py-1.5">
                            <span className={`text-xs font-semibold ${e.status === 'fixed' ? 'text-green-600' : e.status === 'open' ? 'text-amber-500' : 'text-gray-500'}`}>
                              {e.status}
                            </span>
                          </td>
                          <td className="py-1.5 text-gray-400 text-xs">{fmtDate(e.fixed_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Section>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Stat({ label, value, color = 'text-[#26408B]' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
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
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 h-24 animate-pulse" />
      ))}
    </div>
  )
}
