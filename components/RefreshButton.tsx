'use client'

import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

export function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  const [spinning, setSpinning] = useState(false)

  function handleClick() {
    setSpinning(true)
    onRefresh()
    setTimeout(() => setSpinning(false), 800)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#26408B] border border-[#26408B]/20 rounded-lg hover:bg-[#26408B]/5 transition-colors"
    >
      <RefreshCw size={12} className={spinning ? 'animate-spin' : ''} />
      Refresh
    </button>
  )
}
