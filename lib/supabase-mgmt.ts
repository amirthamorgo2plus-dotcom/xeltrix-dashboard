// Supabase Management API — reads DB size, storage, MAU per project.
// Uses SUPABASE_ACCESS_TOKEN (personal access token, never exposed client-side).

const MGMT_API = 'https://api.supabase.com/v1'

function mgmtHeaders() {
  return {
    Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

// Extract project ref from Supabase URL: https://abcdef.supabase.co → abcdef
export function extractProjectRef(supabaseUrl: string): string | null {
  try {
    const host = new URL(supabaseUrl).hostname // abcdef.supabase.co
    return host.split('.')[0] ?? null
  } catch {
    return null
  }
}

export interface ProjectUsage {
  dbSizeBytes: number | null
  storageSizeBytes: number | null
  mau: number | null
  error?: string
}

export async function getProjectUsage(supabaseUrl: string): Promise<ProjectUsage> {
  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    return { dbSizeBytes: null, storageSizeBytes: null, mau: null, error: 'no token' }
  }

  const ref = extractProjectRef(supabaseUrl)
  if (!ref) return { dbSizeBytes: null, storageSizeBytes: null, mau: null, error: 'bad url' }

  try {
    const res = await fetch(`${MGMT_API}/projects/${ref}/usage`, {
      headers: mgmtHeaders(),
      next: { revalidate: 600 },
    })

    if (!res.ok) {
      return { dbSizeBytes: null, storageSizeBytes: null, mau: null, error: `HTTP ${res.status}` }
    }

    const data = await res.json()

    // Supabase usage response shape: array of { metric, usage, ... }
    const metrics: { metric: string; usage: number }[] = Array.isArray(data) ? data : (data.usages ?? [])

    const get = (key: string) => metrics.find((m) => m.metric === key)?.usage ?? null

    return {
      dbSizeBytes: toBytes(get('db_size')),
      storageSizeBytes: toBytes(get('storage_size')),
      mau: get('monthly_active_users'),
    }
  } catch (e) {
    return { dbSizeBytes: null, storageSizeBytes: null, mau: null, error: String(e) }
  }
}

// Supabase reports sizes in bytes already; coerce to number or null
function toBytes(val: number | null): number | null {
  if (val === null || val === undefined) return null
  return Number(val)
}
