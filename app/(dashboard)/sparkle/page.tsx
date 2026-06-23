'use client'

import { useCallback, useEffect, useState } from 'react'
import { ActiveBadge } from '@/components/StatusBadge'
import { RefreshButton } from '@/components/RefreshButton'
import { ConfirmAction } from '@/components/ConfirmAction'

interface Org { id: string; name: string; is_active: boolean; created_at: string }
interface Event { id: string; status: string; created_at: string }
interface Data { orgs: Org[]; staffCount: number; recentEvents: Event[] }

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

  async function toggleOrg(orgId: string, active: boolean) {
    const res = await fetch('/api/apps/sparkle/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, active }),
    })
    if (!res.ok) throw new Error((await res.json()).error)
    await load()
  }

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
        <>
          <Section title="Hotels">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-semibold">Name</th>
                  <th className="text-left pb-2 font-semibold">Status</th>
                  <th className="text-left pb-2 font-semibold">Created</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {data.orgs.map((org) => (
                  <tr key={org.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-medium text-gray-900">{org.name}</td>
                    <td className="py-2"><ActiveBadge active={org.is_active} /></td>
                    <td className="py-2 text-gray-400 text-xs">{new Date(org.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="py-2 text-right">
                      <ConfirmAction
                        label={org.is_active ? 'Deactivate hotel' : 'Activate hotel'}
                        description={`This will ${org.is_active ? 'deactivate' : 'activate'} "${org.name}" and will be audit-logged.`}
                        onConfirm={() => toggleOrg(org.id, !org.is_active)}
                        variant={org.is_active ? 'danger' : 'primary'}
                        buttonLabel={org.is_active ? 'Deactivate' : 'Activate'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Recent Cleaning Events">
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
                    <td className="py-1.5"><span className="text-xs font-semibold text-gray-700">{e.status}</span></td>
                    <td className="py-1.5 text-gray-400 text-xs">{new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
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
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
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
