# Xeltrix Command

Super-admin dashboard for all Xeltrix apps — Next.js 16, TypeScript, Tailwind, Supabase, iron-session.

## Setup

### 1. Install

```bash
cd xeltrix-command
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DASHBOARD_PASSWORD` | Single super-admin password |
| `SESSION_SECRET` | ≥32-char random string for cookie encryption |
| `VERCEL_TOKEN` | Vercel API token (vercel.com → Settings → Tokens) |
| `VERCEL_TEAM_ID` | Vercel team ID (blank = personal account) |
| `VERCEL_PROJECT_<APP>` | Project ID from vercel.com → project → Settings |
| `SUPABASE_<APP>_URL` | Supabase project URL |
| `SUPABASE_<APP>_SERVICE_KEY` | **Service-role** key — never the anon key |

### 3. Create audit log table

Run [`supabase/admin_audit_log.sql`](supabase/admin_audit_log.sql) once in the **Sparkle** Supabase project SQL Editor.

### 4. Dev

```bash
npm run dev   # http://localhost:3000
```

### 5. Deploy

```bash
vercel --prod
```

Add all `.env.local` vars as Vercel Environment Variables. Mark as Production only.

---

## Security

- **Password auth** — cookie encrypted by iron-session (AES-256-CBC). TTL: 8 h.
- **Service keys server-side only** — zero exposure to the browser.
- **Mutations gated** — every write requires explicit confirmation + is written to `admin_audit_log`.
- **Promise.allSettled everywhere** — one app down never breaks the dashboard.
- **DPDP compliant** — MediTrack returns aggregate counts only. No health records queried.

---

## App registry

| App | Tables | Mutations |
|-----|--------|-----------|
| Sparkle | organizations, staff, cleaning_events | Activate / deactivate org |
| MediTrack | users (count), organizations (count) | None — DPDP |
| Team | organizations, staff, attendance | None |
| Kamma Nest | — | None (Phase-2) |
| BrushBuddy | users (count), pros, bookings | Feature / unfeature pro |

---

## Phase-2 stubs

- Traffic analytics per app
- Perks / claims management
- Agents panel
- MediTrack consent audit + data-request tracking
- Kamma Nest community stats
