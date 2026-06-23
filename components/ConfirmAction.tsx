'use client'

import { useState } from 'react'

interface Props {
  label: string
  description: string
  onConfirm: () => Promise<void>
  variant?: 'danger' | 'primary'
  buttonLabel?: string
}

export function ConfirmAction({ label, description, onConfirm, variant = 'primary', buttonLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await onConfirm()
      setOpen(false)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const btnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-[#26408B] hover:bg-[#1a2d63] text-white'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${btnClass}`}
      >
        {buttonLabel ?? label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs mx-4">
            <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 ${btnClass}`}
              >
                {loading ? 'Working…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
