import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/registry'

export async function GET() {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = getSupabaseClient('sparkle')
  if (!client) return NextResponse.json({ error: 'Sparkle not configured' }, { status: 503 })

  const [orgsRes, staffRes, maintenanceRes] = await Promise.allSettled([
    client.from('orgs').select('id, name, slug, address, storage_bytes, last_login_at, created_at').order('name'),
    client.from('staff').select('id, org_id, active'),
    client.from('maintenance').select('id, org_id, status, urgent'),
  ])

  const orgs = orgsRes.status === 'fulfilled' ? (orgsRes.value.data ?? []) : []
  const staff = staffRes.status === 'fulfilled' ? (staffRes.value.data ?? []) : []
  const maintenance = maintenanceRes.status === 'fulfilled' ? (maintenanceRes.value.data ?? []) : []

  // Build per-org counts in JS
  const staffCountByOrg: Record<string, number> = {}
  for (const s of staff) {
    staffCountByOrg[s.org_id] = (staffCountByOrg[s.org_id] ?? 0) + 1
  }

  const complaintsMap: Record<string, { open: number; urgent: number }> = {}
  for (const m of maintenance) {
    if (m.status === 'fixed') continue
    if (!complaintsMap[m.org_id]) complaintsMap[m.org_id] = { open: 0, urgent: 0 }
    complaintsMap[m.org_id].open++
    if (m.urgent) complaintsMap[m.org_id].urgent++
  }

  return NextResponse.json({
    orgs: orgs.map((org) => ({
      ...org,
      staffCount: staffCountByOrg[org.id] ?? 0,
      openComplaints: complaintsMap[org.id]?.open ?? 0,
      urgentComplaints: complaintsMap[org.id]?.urgent ?? 0,
    })),
  })
}
