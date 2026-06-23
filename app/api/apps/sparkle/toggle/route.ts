import { NextRequest, NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/registry'
import { writeAuditLog } from '@/lib/audit'

export async function POST(req: NextRequest) {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { orgId, active } = body

  if (!orgId || typeof active !== 'boolean') {
    return NextResponse.json({ error: 'orgId and active (boolean) required' }, { status: 400 })
  }

  const client = getSupabaseClient('sparkle')
  if (!client) return NextResponse.json({ error: 'Sparkle not configured' }, { status: 503 })

  const { error } = await client.from('organizations').update({ is_active: active }).eq('id', orgId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({ app: 'sparkle', action: active ? 'org_activated' : 'org_deactivated', targetId: orgId, targetType: 'organization', payload: { active } })

  return NextResponse.json({ ok: true })
}
