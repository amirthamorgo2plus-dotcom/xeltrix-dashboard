import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { APP_REGISTRY, getSupabaseClient } from '@/lib/registry'
import { getLastDeployment, pingUrl } from '@/lib/vercel'

export const runtime = 'nodejs'

async function getAppStats(app: (typeof APP_REGISTRY)[0]) {
  const client = getSupabaseClient(app.key)

  let userCount: number | null = null
  if (client) {
    for (const table of ['users', 'profiles', 'staff']) {
      const { count, error } = await client.from(table).select('*', { count: 'exact', head: true })
      if (!error && count !== null) { userCount = count; break }
    }
  }

  const pingResult = app.supabaseUrl
    ? await pingUrl(`${app.supabaseUrl}/rest/v1/`)
    : { ok: false, ms: 0 }

  const deploy = app.vercelProjectId ? await getLastDeployment(app.vercelProjectId) : null

  return { key: app.key, label: app.label, description: app.description, phase: app.phase, userCount, ping: pingResult, deploy }
}

export async function GET() {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settled = await Promise.allSettled(APP_REGISTRY.map(getAppStats))

  const apps = settled.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { key: APP_REGISTRY[i].key, label: APP_REGISTRY[i].label, description: APP_REGISTRY[i].description, phase: APP_REGISTRY[i].phase, userCount: null, ping: { ok: false, ms: 0 }, deploy: null, error: String((r as PromiseRejectedResult).reason) }
  )

  return NextResponse.json({
    apps,
    totalUsers: apps.reduce((s, a) => s + (a.userCount ?? 0), 0),
    appsUp: apps.filter((a) => a.ping.ok).length,
    totalApps: apps.length,
    fetchedAt: new Date().toISOString(),
  })
}
