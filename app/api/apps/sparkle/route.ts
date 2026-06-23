import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/registry'

export async function GET() {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = getSupabaseClient('sparkle')
  if (!client) return NextResponse.json({ error: 'Sparkle not configured' }, { status: 503 })

  const [orgsRes, staffRes, eventsRes] = await Promise.allSettled([
    client.from('organizations').select('id, name, is_active, created_at').order('created_at', { ascending: false }),
    client.from('staff').select('*', { count: 'exact', head: true }),
    client.from('cleaning_events').select('id, status, created_at').order('created_at', { ascending: false }).limit(20),
  ])

  return NextResponse.json({
    orgs: orgsRes.status === 'fulfilled' ? (orgsRes.value.data ?? []) : [],
    staffCount: staffRes.status === 'fulfilled' ? (staffRes.value.count ?? 0) : 0,
    recentEvents: eventsRes.status === 'fulfilled' ? (eventsRes.value.data ?? []) : [],
  })
}
