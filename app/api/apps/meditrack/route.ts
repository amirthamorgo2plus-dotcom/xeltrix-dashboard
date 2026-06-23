import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/registry'

// DPDP compliance: aggregate counts only — no individual records ever exposed.
export async function GET() {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = getSupabaseClient('meditrack')
  if (!client) return NextResponse.json({ error: 'MediTrack not configured' }, { status: 503 })

  const [usersRes, orgsRes] = await Promise.allSettled([
    client.from('users').select('*', { count: 'exact', head: true }),
    client.from('organizations').select('*', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    userCount: usersRes.status === 'fulfilled' ? (usersRes.value.count ?? null) : null,
    orgCount: orgsRes.status === 'fulfilled' ? (orgsRes.value.count ?? null) : null,
    notice: 'DPDP compliant — aggregate counts only.',
  })
}
