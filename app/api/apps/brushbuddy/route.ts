import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/registry'

export async function GET() {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = getSupabaseClient('brushbuddy')
  if (!client) return NextResponse.json({ error: 'BrushBuddy not configured' }, { status: 503 })

  const [usersRes, prosRes, bookingsRes] = await Promise.allSettled([
    client.from('users').select('*', { count: 'exact', head: true }),
    client.from('pros').select('id, name, service_type, is_featured, rating, created_at').order('created_at', { ascending: false }).limit(50),
    client.from('bookings').select('id, status, created_at').order('created_at', { ascending: false }).limit(30),
  ])

  return NextResponse.json({
    userCount: usersRes.status === 'fulfilled' ? (usersRes.value.count ?? 0) : 0,
    pros: prosRes.status === 'fulfilled' ? (prosRes.value.data ?? []) : [],
    recentBookings: bookingsRes.status === 'fulfilled' ? (bookingsRes.value.data ?? []) : [],
  })
}
