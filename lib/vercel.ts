export interface VercelDeployment {
  uid: string
  name: string
  state: string
  createdAt: number
  url: string
  readyState: string
}

export interface DeployInfo {
  projectId: string
  deployedAt: string | null
  status: string | null
  url: string | null
  error?: string
}

const VERCEL_API = 'https://api.vercel.com'

function vercelHeaders() {
  return {
    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function getLastDeployment(projectId: string): Promise<DeployInfo> {
  if (!projectId || !process.env.VERCEL_TOKEN) {
    return { projectId, deployedAt: null, status: null, url: null, error: 'not configured' }
  }

  try {
    const teamParam = process.env.VERCEL_TEAM_ID ? `&teamId=${process.env.VERCEL_TEAM_ID}` : ''
    const res = await fetch(
      `${VERCEL_API}/v6/deployments?projectId=${projectId}&limit=1${teamParam}`,
      { headers: vercelHeaders(), next: { revalidate: 600 } }
    )

    if (!res.ok) {
      return { projectId, deployedAt: null, status: null, url: null, error: `HTTP ${res.status}` }
    }

    const data = await res.json()
    const deploy: VercelDeployment | undefined = data.deployments?.[0]

    if (!deploy) {
      return { projectId, deployedAt: null, status: null, url: null }
    }

    return {
      projectId,
      deployedAt: new Date(deploy.createdAt).toISOString(),
      status: deploy.readyState,
      url: deploy.url ? `https://${deploy.url}` : null,
    }
  } catch (e) {
    return { projectId, deployedAt: null, status: null, url: null, error: String(e) }
  }
}

export async function pingUrl(url: string): Promise<{ ok: boolean; ms: number }> {
  const start = Date.now()
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(5000) })
    return { ok: res.ok || res.status < 500, ms: Date.now() - start }
  } catch {
    return { ok: false, ms: Date.now() - start }
  }
}
