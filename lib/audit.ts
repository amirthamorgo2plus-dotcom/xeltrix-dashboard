import { getSupabaseClient } from './registry'

interface AuditPayload {
  app: string
  action: string
  targetId?: string
  targetType?: string
  payload?: Record<string, unknown>
}

// Writes to admin_audit_log in the Sparkle DB (designated command DB).
// Falls back silently — a failed audit write should never break the mutation.
export async function writeAuditLog(entry: AuditPayload): Promise<void> {
  try {
    const client = getSupabaseClient('sparkle')
    if (!client) return

    await client.from('admin_audit_log').insert({
      app: entry.app,
      action: entry.action,
      target_id: entry.targetId ?? null,
      target_type: entry.targetType ?? null,
      payload: entry.payload ?? null,
    })
  } catch {
    console.error('[audit] failed to write log:', entry)
  }
}
