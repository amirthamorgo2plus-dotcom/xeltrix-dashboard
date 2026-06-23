'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshButton } from '@/components/RefreshButton'
import { ShieldCheck } from 'lucide-react'

interface Data { userCount: number | null; orgCount: number | null; notice: string }

export default function MediTrackPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/apps/meditrack', { cache: 'no-store' })
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
          <h1 className="text-xl font-bold text-gray-900">MediTrack</h1>
          <p className="text-xs text-gray-400">Medical records — DPDP compliant view</p>
        </div>
        <RefreshButton onRefresh={load} />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3">
        <ShieldCheck size={16} className="text-[#26408B] mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-[#26408B] mb-0.5">DPDP Compliance Active</p>
          <p className="text-xs text-blue-700">Individual health records are never accessible through Xeltrix Command. Only aggregate counts are shown. All access is logged.</p>
        </div>
      </div>

      {loading && !data && (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-100" />)}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Registered Users" value={data.userCount != null ? data.userCount.toLocaleString() : 'N/A'} />
          <Stat label="Organisations" value={data.orgCount != null ? data.orgCount.toLocaleString() : 'N/A'} />
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-6">
        <p className="text-xs font-semibold text-amber-800 mb-1">Phase-2 placeholder</p>
        <p className="text-xs text-amber-700">Usage analytics, consent audit, and data-request tracking will appear here in Phase 2.</p>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#26408B]">{value}</p>
    </div>
  )
}
