'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshButton } from '@/components/RefreshButton'
import { ArrowLeft } from 'lucide-react'

interface OrgSummary {
  id: string; name: string; slug: string
  address: string | null; storage_bytes: number | null
  last_login_at: string | null; created_at: string
  staffCount: number; openComplaints: number; urgentComplaints: number
}

interface Staff {
  id: string; name: string; role: string
  phone: string | null; language: string | null
  active: boolean; created_at: string
}
interface CleaningEvent {
  id: string; event: string; room_no: string | null
  cleaner_name: string | null; duration_secs: number | null; created_at: string
}
interface Maintenance {
  id: string; issue: string; status: string
  urgent: boolean; room_no: string | null
  reported_name: string | null; fixed_at: string | null; created_at: string
}
interface OrgDetail {
  org: OrgSummary | null
  staff: Staff[]
  recentEvents: CleaningEvent[]
  maintenance: Maintenance[]
}

function fmtBytes(b: number | null) {
  if (!b) return '—'
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
}

// ─── Hotel list ───────────────────────────────────────────────────────────────

function HotelList({ orgs, onSelect }: { orgs: OrgSummary[]; onSelect: (org: OrgSummary) => void }) {
  const totalStaff = orgs.reduce((s, o) => s + o.staffCount, 0)
  const totalComplaints = orgs.reduce((s, o) => s + o.openComplaints, 0)
  const totalUrgent = orgs.reduce((s, o) => s + o.urgentComplaints, 0)

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Hotels" value={orgs.length} />
        <Stat label="Total staff" value={totalStaff} />
        <Stat label="Open issues" value={totalComplaints} color={totalComplaints > 0 ? 'text-amber-500' : 'text-[#26408B]'} />
        <Stat label="Urgent" value={totalUrgent} color={totalUrgent > 0 ? 'text-red-500' : 'text-gray-400'} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold">Hotel</th>
              <th className="text-left px-4 py-3 font-semibold">Address</th>
              <th className="text-center px-4 py-3 font-semibold">Staff</th>
              <th className="text-center px-4 py-3 font-semibold">Open issues</th>
              <th className="text-left px-4 py-3 font-semibold">Storage</th>
              <th className="text-left px-4 py-3 font-semibold">Last login</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr
                key={org.id}
                onClick={() => onSelect(org)}
                className="border-b border-gray-50 last:border-0 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{org.name}</p>
                  <p className="text-[11px] text-gray-400">{org.slug}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{org.address ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-bold text-[#26408B]">{org.staffCount}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {org.openComplaints === 0 ? (
                    <span className="text-xs text-gray-400">—</span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span className={`text-sm font-bold ${org.urgentComplaints > 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {org.openComplaints}
                      </span>
                      {org.urgentComplaints > 0 && (
                        <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-1 py-0.5 rounded">
                          {org.urgentComplaints} urgent
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{fmtBytes(org.storage_bytes)}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(org.last_login_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Hotel detail ─────────────────────────────────────────────────────────────

function HotelDetail({ org, onBack }: { org: OrgSummary; onBack: () => void }) {
  const [detail, setDetail] = useState<OrgDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'staff' | 'events' | 'issues'>('staff')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/apps/sparkle/${org.id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(setDetail)
      .finally(() => setLoading(false))
  }, [org.id])

  const openIssues = detail?.maintenance.filter(m => m.status !== 'fixed') ?? []
  const urgentCount = openIssues.filter(m => m.urgent).length

  return (
    <div>
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#26408B] transition-colors"
        >
          <ArrowLeft size={16} />
          All hotels
        </button>
        <span className="text-gray-300">/</span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{org.name}</h1>
          <p className="text-xs text-gray-400">{org.slug} · {org.address ?? 'No address'}</p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Staff" value={detail?.staff.length ?? '…'} />
        <Stat label="Open issues" value={loading ? '…' : openIssues.length} color={openIssues.length > 0 ? 'text-amber-500' : 'text-[#26408B]'} />
        <Stat label="Urgent" value={loading ? '…' : urgentCount} color={urgentCount > 0 ? 'text-red-500' : 'text-gray-400'} />
        <Stat label="Storage" value={fmtBytes(org.storage_bytes)} color="text-gray-700" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {(['staff', 'events', 'issues'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === t ? 'bg-white text-[#26408B] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'events' ? 'Cleaning Events' : t === 'issues' ? 'Maintenance' : 'Staff'}
          </button>
        ))}
      </div>

      {loading && <Skeleton />}

      {!loading && detail && (
        <>
          {/* Staff tab */}
          {tab === 'staff' && (
            <Section title={`Staff (${detail.staff.length})`}>
              {detail.staff.length === 0 ? (
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
                    {detail.staff.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 font-medium text-gray-900">{s.name}</td>
                        <td className="py-2 text-xs text-gray-500 capitalize">{s.role}</td>
                        <td className="py-2 text-xs text-gray-500">{s.phone ?? '—'}</td>
                        <td className="py-2 text-xs text-gray-500 uppercase">{s.language ?? '—'}</td>
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

          {/* Cleaning Events tab */}
          {tab === 'events' && (
            <Section title={`Cleaning Events (${detail.recentEvents.length})`}>
              {detail.recentEvents.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No events yet.</p>
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
                    {detail.recentEvents.map((e) => (
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
          )}

          {/* Maintenance tab */}
          {tab === 'issues' && (
            <Section title={`Maintenance — ${openIssues.length} open${urgentCount > 0 ? `, ${urgentCount} urgent` : ''}`}>
              {detail.maintenance.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No issues reported.</p>
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
                    {detail.maintenance.map((m) => (
                      <tr key={m.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-1.5 text-xs text-gray-800 max-w-xs">
                          {m.urgent && <span className="mr-1 text-red-500 font-bold text-sm">!</span>}
                          {m.issue}
                        </td>
                        <td className="py-1.5 text-xs text-gray-500">{m.room_no ?? '—'}</td>
                        <td className="py-1.5 text-xs text-gray-500">{m.reported_name ?? '—'}</td>
                        <td className="py-1.5">
                          <span className={`text-xs font-semibold ${
                            m.status === 'fixed' ? 'text-green-600' : 'text-amber-500'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-1.5 text-gray-400 text-xs">{fmtDate(m.fixed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>
          )}
        </>
      )}
    </div>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function SparklePage() {
  const [orgs, setOrgs] = useState<OrgSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState<OrgSummary | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/apps/sparkle', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setOrgs(data.orgs ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      {/* Header — only show on list view */}
      {!selectedOrg && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sparkle</h1>
            <p className="text-xs text-gray-400">Hotel housekeeping management</p>
          </div>
          <RefreshButton onRefresh={load} />
        </div>
      )}

      {loading && !orgs.length && <Skeleton />}

      {!loading && !selectedOrg && (
        <HotelList orgs={orgs} onSelect={setSelectedOrg} />
      )}

      {selectedOrg && (
        <HotelDetail org={selectedOrg} onBack={() => setSelectedOrg(null)} />
      )}
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 h-16 animate-pulse" />
      ))}
    </div>
  )
}
