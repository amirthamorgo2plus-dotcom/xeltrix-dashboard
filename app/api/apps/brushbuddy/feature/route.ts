import { NextRequest, NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/registry'
import { writeAuditLog } from '@/lib/audit'

export async function POST(req: NextRequest) {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { proId, featured } = body

  if (!proId || typeof featured !== 'boolean') {
    return NextResponse.json({ error: 'proId and featured (boolean) required' }, { status: 400 })
  }

  const client = getSupabaseClient('brushbuddy')
  if (!client) return NextResponse.json({ error: 'BrushBuddy not configured' }, { status: 503 })

  const { error } = await client.from('pros').update({ is_featured: featured }).eq('id', proId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({ app: 'brushbuddy', action: featured ? 'pro_featured' : 'pro_unfeatured', targetId: proId, targetType: 'pro', payload: { featured } })

  return NextResponse.json({ ok: true })
}
