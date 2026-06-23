-- Run this once in your SPARKLE Supabase project (SQL Editor).
-- Xeltrix Command writes all mutating admin actions here.

create table if not exists admin_audit_log (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default now() not null,
  app         text        not null,
  action      text        not null,
  target_id   text,
  target_type text,
  payload     jsonb
);

-- Keep 90 days of log; older rows auto-delete.
create index if not exists admin_audit_log_created_idx on admin_audit_log (created_at desc);

-- Row-level security: deny all direct client access (service-role bypasses RLS).
alter table admin_audit_log enable row level security;
create policy "deny_all_client_access" on admin_audit_log for all using (false);
