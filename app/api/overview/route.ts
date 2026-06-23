import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'
import { APP_REGISTRY, getSupabaseClient } from '@/lib/registry'
import { createClient } from '@supabase/supabase-js'
import { getLastDeployment, pingUrl } from '@/lib/vercel'
import { getProjectUsage } from '@/lib/supabase-mgmt'

export const runtime = 'nodejs'

async function getAppStats(app: (typeof APP_REGISTRY)[0]) {
  const client = getSupabaseClient(app.key)

  // Public table user count
  let userCount: number | null = null
  if (client) {
    for (const table of ['users', 'profiles', 'staff']) {
      const { count, error } = await client.from(table).select('*', { count: 'exact', head: true })
      if (!error && count !== null) { userCount = count; break }
    }
  }

  // Auth users count
  let authUserCount: number | null = null
  if (app.supabaseUrl && app.supabaseServiceKey) {
    try {
      const authClient = createClient(app.supabaseUrl, app.supabaseServiceKey, {
        auth: { persistSession: false },
        db: { schema: 'auth' },
      })
      const { count } = await authClient.from('users').select('*', { count: 'exact', head: true })
      authUserCount = count ?? null
    } catch { /* not available */ }
  }

  // Last activity
  let lastActivity: string | null = null
  if (client) {
    for (const table of ['users', 'bookings', 'staff', 'orgs', 'organizations', 'cleaning_events', 'attendance']) {
      try {
        const { data } = await client.from(table).select('created_at').order('created_at', { ascending: false }).limit(1)
        if (data?.[0]?.created_at) { lastActivity = data[0].created_at; break }
      } catch { /* table doesn't exist */ }
    }
  }

  // DB size, storage, MAU from Management API
  const usage = app.supabaseUrl
    ? await getProjectUsage(app.supabaseUrl)
    : { dbSizeBytes: null, storageSizeBytes: null, mau: null }

  // Ping
  const pingResult = app.supabaseUrl
    ? await pingUrl(`${app.supabaseUrl}/rest/v1/`)
    : { ok: false, ms: 0 }

  // Last Vercel deploy
  const deploy = app.vercelProjectId ? await getLastDeployment(app.vercelProjectId) : null

  return {
    key: app.key,
    label: app.label,
    description: app.description,
    phase: app.phase,
    userCount,
    authUserCount,
    dbSizeBytes: usage.dbSizeBytes,
    storageSizeBytes: usage.storageSizeBytes,
    mau: usage.mau,
    lastActivity,
    ping: pingResult,
    deploy,
  }
}

export async function GET() {
  if (!(await checkApiAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settled = await Promise.allSettled(APP_REGISTRY.map(getAppStats))

  const apps = settled.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          key: APP_REGISTRY[i].key,
          label: APP_REGISTRY[i].label,
          description: APP_REGISTRY[i].description,
          phase: APP_REGISTRY[i].phase,
          userCount: null, authUserCount: null,
          dbSizeBytes: null, storageSizeBytes: null, mau: null,
          lastActivity: null,
          ping: { ok: false, ms: 0 },
          deploy: null,
          error: String((r as PromiseRejectedResult).reason),
        }
  )

  return NextResponse.json({
    apps,
    totalUsers: apps.reduce((s, a) => s + (a.userCount ?? 0), 0),
    totalDbBytes: apps.reduce((s, a) => s + (a.dbSizeBytes ?? 0), 0),
    totalStorageBytes: apps.reduce((s, a) => s + (a.storageSizeBytes ?? 0), 0),
    appsUp: apps.filter((a) => a.ping.ok).length,
    totalApps: apps.length,
    fetchedAt: new Date().toISOString(),
  })
}
