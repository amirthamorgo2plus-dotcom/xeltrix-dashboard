import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type AppKey = 'sparkle' | 'meditrack' | 'team' | 'kammanest' | 'brushbuddy'

export interface AppMeta {
  key: AppKey
  label: string
  description: string
  vercelProjectId: string | undefined
  supabaseUrl: string | undefined
  supabaseServiceKey: string | undefined
  phase?: 'live' | 'coming-soon'
}

export const APP_REGISTRY: AppMeta[] = [
  {
    key: 'sparkle',
    label: 'Sparkle',
    description: 'Hotel housekeeping management',
    vercelProjectId: process.env.VERCEL_PROJECT_SPARKLE,
    supabaseUrl: process.env.SUPABASE_SPARKLE_URL,
    supabaseServiceKey: process.env.SUPABASE_SPARKLE_SERVICE_KEY,
    phase: 'live',
  },
  {
    key: 'meditrack',
    label: 'MediTrack',
    description: 'Medical records (DPDP — counts only)',
    vercelProjectId: process.env.VERCEL_PROJECT_MEDITRACK,
    supabaseUrl: process.env.SUPABASE_MEDITRACK_URL,
    supabaseServiceKey: process.env.SUPABASE_MEDITRACK_SERVICE_KEY,
    phase: 'live',
  },
  {
    key: 'team',
    label: 'Team',
    description: 'Orgs, staff & attendance',
    vercelProjectId: process.env.VERCEL_PROJECT_TEAM,
    supabaseUrl: process.env.SUPABASE_TEAM_URL,
    supabaseServiceKey: process.env.SUPABASE_TEAM_SERVICE_KEY,
    phase: 'live',
  },
  {
    key: 'kammanest',
    label: 'Kamma Nest',
    description: 'Heritage community app',
    vercelProjectId: process.env.VERCEL_PROJECT_KAMMANEST,
    supabaseUrl: process.env.SUPABASE_KAMMANEST_URL,
    supabaseServiceKey: process.env.SUPABASE_KAMMANEST_SERVICE_KEY,
    phase: 'live',
  },
  {
    key: 'brushbuddy',
    label: 'BrushBuddy',
    description: 'Home services marketplace',
    vercelProjectId: process.env.VERCEL_PROJECT_BRUSHBUDDY,
    supabaseUrl: process.env.SUPABASE_BRUSHBUDDY_URL,
    supabaseServiceKey: process.env.SUPABASE_BRUSHBUDDY_SERVICE_KEY,
    phase: 'live',
  },
]

const clientCache = new Map<AppKey, SupabaseClient>()

export function getSupabaseClient(appKey: AppKey): SupabaseClient | null {
  if (clientCache.has(appKey)) return clientCache.get(appKey)!

  const meta = APP_REGISTRY.find((a) => a.key === appKey)
  if (!meta?.supabaseUrl || !meta?.supabaseServiceKey) return null

  const client = createClient(meta.supabaseUrl, meta.supabaseServiceKey, {
    auth: { persistSession: false },
  })
  clientCache.set(appKey, client)
  return client
}
