import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/registry'

export async function GET() {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = getSupabaseClient('team')
  if (!client) return NextResponse.json({ error: 'Team not configured' }, { status: 503 })

  const [orgsRes, staffRes, attendanceRes] = await Promise.allSettled([
    client.from('organizations').select('id, name, created_at').order('created_at', { ascending: false }),
    client.from('staff').select('id, name, org_id, role').limit(100),
    client.from('attendance').select('id, staff_id, date, status').order('date', { ascending: false }).limit(50),
  ])

  return NextResponse.json({
    orgs: orgsRes.status === 'fulfilled' ? (orgsRes.value.data ?? []) : [],
    staff: staffRes.status === 'fulfilled' ? (staffRes.value.data ?? []) : [],
    recentAttendance: attendanceRes.status === 'fulfilled' ? (attendanceRes.value.data ?? []) : [],
  })
}
