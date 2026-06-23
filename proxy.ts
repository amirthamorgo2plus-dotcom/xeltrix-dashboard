import { NextRequest, NextResponse } from 'next/server'
import { unsealData } from 'iron-session'
import { SessionData, sessionOptions } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  try {
    const cookieValue = req.cookies.get(sessionOptions.cookieName)?.value
    if (!cookieValue) throw new Error('no session cookie')

    const session = await unsealData<SessionData>(cookieValue, {
      password: sessionOptions.password as string,
      ttl: sessionOptions.ttl,
    })

    if (!session.isLoggedIn) throw new Error('not logged in')
  } catch {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
