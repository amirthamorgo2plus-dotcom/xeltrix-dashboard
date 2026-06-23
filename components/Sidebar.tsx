'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Sparkles, HeartPulse, Users, Home, Brush, Search, LogOut, ChevronRight } from 'lucide-react'

const NAV = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/sparkle', label: 'Sparkle', icon: Sparkles },
  { href: '/meditrack', label: 'MediTrack', icon: HeartPulse },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/kammanest', label: 'Kamma Nest', icon: Home },
  { href: '/brushbuddy', label: 'BrushBuddy', icon: Brush },
  { href: '/search', label: 'User Search', icon: Search },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[#26408B] min-h-screen">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity=".6" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity=".6" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity=".3" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase leading-none">Xeltrix</p>
          <p className="text-sm font-bold text-white leading-tight">Command</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="opacity-50" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
