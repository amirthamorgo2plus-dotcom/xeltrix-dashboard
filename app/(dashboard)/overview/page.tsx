'use client'

import { useCallback, useEffect, useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'
import { RefreshButton } from '@/components/RefreshButton'
import { Activity, Server, Users, Zap, Database, HardDrive } from 'lucide-react'

interface AppStat {
  key: string
  label: string
  description: string
  phase?: string
  userCount: number | null
  authUserCount: number | null
  storageBytes: number | null
  lastActivity: string | null
  ping: { ok: boolean; ms: number }
  deploy: { deployedAt: string | null; status: string | null; url: string | null } | null
  error?: string
}

interface OverviewData {
  apps: AppStat[]
  totalUsers: number
  totalStorage: number
  appsUp: number
  totalApps: number
  fetchedAt: string
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function fmtBytes(bytes: number | null) {
  if (bytes === null) return '—'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

function deployColor(status: string | null) {
  if (!status) return 'text-gray-400'
  if (status === 'READY') return 'text-green-600'
  if (status === 'ERROR' || status === 'CANCELED') return 'text-red-500'
  return 'text-amber-500'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/overview', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Overview</h1>
          {data && (
            <p className="text-xs text-gray-400 mt-0.5">Last updated {fmt(data.fetchedAt)}</p>
          )}
        </div>
        <RefreshButton onRefresh={load} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      {/* Summary strip */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Users', value: data.totalUsers.toLocaleString(), icon: Users, color: 'text-[#26408B]' },
            { label: 'Storage Used', value: fmtBytes(data.totalStorage), icon: HardDrive, color: 'text-purple-600' },
            { label: 'Apps Online', value: `${data.appsUp} / ${data.totalApps}`, icon: Server, color: 'text-green-600' },
            { label: 'Status', value: data.appsUp === data.totalApps ? 'All Green' : 'Issues', icon: Zap, color: data.appsUp === data.totalApps ? 'text-green-600' : 'text-amber-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                <Icon size={14} className={color} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse h-48" />
          ))}
        </div>
      )}

      {/* Per-app cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {data.apps.map((app) => (
            <div key={app.key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{app.label}</p>
                  <p className="text-xs text-gray-400">{app.description}</p>
                </div>
                <StatusBadge ok={app.ping.ok} label={app.ping.ok ? `${app.ping.ms}ms` : 'Down'} />
              </div>

              <div className="border-t border-gray-50 mb-3" />

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3">
                <MiniStat icon={Users} label="Users" value={app.userCount != null ? app.userCount.toLocaleString() : '—'} />
                <MiniStat icon={Activity} label="Auth users" value={app.authUserCount != null ? app.authUserCount.toLocaleString() : '—'} />
                <MiniStat icon={HardDrive} label="Storage" value={fmtBytes(app.storageBytes)} />
                <MiniStat icon={Database} label="Last activity" value={app.lastActivity ? timeAgo(app.lastActivity) : '—'} />
              </div>

              <div className="border-t border-gray-50 pt-2 space-y-1.5">
                <Row label="Last deploy" value={fmt(app.deploy?.deployedAt ?? null)} />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Deploy status</span>
                  <span className={`font-semibold ${deployColor(app.deploy?.status ?? null)}`}>
                    {app.deploy?.status ?? '—'}
                  </span>
                </div>
              </div>

              {app.error && (
                <p className="text-[10px] text-red-400 mt-2 truncate">{app.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MiniStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className="text-gray-400" />
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  )
}
