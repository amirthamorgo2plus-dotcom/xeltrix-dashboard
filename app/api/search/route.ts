import { NextRequest, NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { getSupabaseClient, AppKey } from '@/lib/registry'

interface SearchResult {
  app: string
  table: string
  id: string
  name: string | null
  email: string | null
  phone: string | null
  createdAt: string | null
}

const SEARCH_TARGETS: { app: AppKey; table: string; nameCol: string; emailCol?: string; phoneCol?: string }[] = [
  { app: 'sparkle', table: 'staff', nameCol: 'name', emailCol: 'email', phoneCol: 'phone' },
  { app: 'brushbuddy', table: 'users', nameCol: 'name', emailCol: 'email', phoneCol: 'phone' },
  { app: 'brushbuddy', table: 'pros', nameCol: 'name', emailCol: 'email', phoneCol: 'phone' },
  { app: 'team', table: 'staff', nameCol: 'name', emailCol: 'email', phoneCol: 'phone' },
  { app: 'kammanest', table: 'users', nameCol: 'name', emailCol: 'email', phoneCol: 'phone' },
]

async function searchInApp(target: (typeof SEARCH_TARGETS)[0], query: string): Promise<SearchResult[]> {
  const client = getSupabaseClient(target.app)
  if (!client) return []

  const cols = ['id', target.nameCol, 'created_at']
  if (target.emailCol) cols.push(target.emailCol)
  if (target.phoneCol) cols.push(target.phoneCol)

  const orFilter = [
    `${target.nameCol}.ilike.%${query}%`,
    target.emailCol ? `${target.emailCol}.ilike.%${query}%` : null,
    target.phoneCol ? `${target.phoneCol}.ilike.%${query}%` : null,
  ].filter(Boolean).join(',')

  const { data, error } = await client.from(target.table).select(cols.join(', ')).or(orFilter).limit(10)
  if (error || !data) return []

  return (data as unknown as Record<string, unknown>[]).map((row) => ({
    app: target.app,
    table: target.table,
    id: String(row.id),
    name: row[target.nameCol] != null ? String(row[target.nameCol]) : null,
    email: target.emailCol && row[target.emailCol] != null ? String(row[target.emailCol]) : null,
    phone: target.phoneCol && row[target.phoneCol] != null ? String(row[target.phoneCol]) : null,
    createdAt: row.created_at != null ? String(row.created_at) : null,
  }))
}

export async function GET(req: NextRequest) {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [], query: q ?? '' })

  const settled = await Promise.allSettled(SEARCH_TARGETS.map((t) => searchInApp(t, q)))
  const results = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))

  return NextResponse.json({ results, query: q, count: results.length })
}
