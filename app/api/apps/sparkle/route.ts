import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/registry'

export async function GET() {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = getSupabaseClient('sparkle')
  if (!client) return NextResponse.json({ error: 'Sparkle not configured' }, { status: 503 })

  const [orgsRes, staffRes, eventsRes, maintenanceRes] = await Promise.allSettled([
    client.from('orgs').select('id, name, slug, address, storage_bytes, last_login_at, created_at').order('created_at', { ascending: false }),
    client.from('staff').select('*', { count: 'exact', head: true }),
    client.from('cleaning_events').select('id, status, created_at').order('created_at', { ascending: false }).limit(20),
    client.from('maintenance').select('id, status, created_at').order('created_at', { ascending: false }).limit(10),
  ])

  return NextResponse.json({
    orgs: orgsRes.status === 'fulfilled' ? (orgsRes.value.data ?? []) : [],
    staffCount: staffRes.status === 'fulfilled' ? (staffRes.value.count ?? 0) : 0,
    recentEvents: eventsRes.status === 'fulfilled' ? (eventsRes.value.data ?? []) : [],
    recentMaintenance: maintenanceRes.status === 'fulfilled' ? (maintenanceRes.value.data ?? []) : [],
  })
}
