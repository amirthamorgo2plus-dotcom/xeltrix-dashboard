import { NextRequest, NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/registry'

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orgId } = await params
  const client = getSupabaseClient('sparkle')
  if (!client) return NextResponse.json({ error: 'Sparkle not configured' }, { status: 503 })

  const [orgRes, staffRes, eventsRes, maintenanceRes] = await Promise.allSettled([
    client.from('orgs').select('id, name, slug, address, storage_bytes, last_login_at, created_at').eq('id', orgId).single(),
    client.from('staff').select('id, name, role, phone, language, active, created_at').eq('org_id', orgId).order('name'),
    client.from('cleaning_events').select('id, event, room_no, cleaner_name, duration_secs, created_at').eq('org_id', orgId).order('created_at', { ascending: false }).limit(20),
    client.from('maintenance').select('id, issue, status, urgent, room_no, reported_name, fixed_at, created_at').eq('org_id', orgId).order('created_at', { ascending: false }).limit(30),
  ])

  return NextResponse.json({
    org: orgRes.status === 'fulfilled' ? orgRes.value.data : null,
    staff: staffRes.status === 'fulfilled' ? (staffRes.value.data ?? []) : [],
    recentEvents: eventsRes.status === 'fulfilled' ? (eventsRes.value.data ?? []) : [],
    maintenance: maintenanceRes.status === 'fulfilled' ? (maintenanceRes.value.data ?? []) : [],
  })
}
