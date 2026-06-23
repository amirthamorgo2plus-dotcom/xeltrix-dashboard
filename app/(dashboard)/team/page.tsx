'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshButton } from '@/components/RefreshButton'

interface Org { id: string; name: string; created_at: string }
interface Staff { id: string; name: string; org_id: string; role: string }
interface Attendance { id: string; staff_id: string; date: string; status: string }
interface Data { orgs: Org[]; staff: Staff[]; recentAttendance: Attendance[] }

export default function TeamPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/apps/team', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const attendanceSummary = data?.recentAttendance.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team</h1>
          <p className="text-xs text-gray-400">Organisations, staff & attendance</p>
        </div>
        <RefreshButton onRefresh={load} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Organisations" value={data?.orgs.length ?? '…'} />
        <Stat label="Staff" value={data?.staff.length ?? '…'} />
        <Stat label="Attendance Records" value={data?.recentAttendance.length ?? '…'} />
      </div>

      {loading && !data && <Skeleton />}

      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Section title="Organisations">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-2 font-semibold">Name</th>
                    <th className="text-left pb-2 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orgs.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 font-medium text-gray-900">{o.name}</td>
                      <td className="py-1.5 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="Recent Attendance">
              {attendanceSummary && (
                <div className="flex gap-3 mb-3">
                  {Object.entries(attendanceSummary).map(([status, count]) => (
                    <span key={status} className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-md text-gray-700">
                      {status}: {count}
                    </span>
                  ))}
                </div>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-2 font-semibold">Staff ID</th>
                    <th className="text-left pb-2 font-semibold">Date</th>
                    <th className="text-left pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAttendance.slice(0, 15).map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 text-gray-400 text-xs font-mono">{a.staff_id.slice(0, 8)}…</td>
                      <td className="py-1.5 text-gray-700 text-xs">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                      <td className="py-1.5">
                        <span className={`text-xs font-semibold ${a.status === 'present' ? 'text-green-600' : a.status === 'absent' ? 'text-red-500' : 'text-gray-500'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </div>
        </>
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
    <div className="grid grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-xl h-48 animate-pulse border border-gray-100" />)}
    </div>
  )
}
