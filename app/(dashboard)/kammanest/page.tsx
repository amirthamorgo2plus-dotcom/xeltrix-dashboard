export default function KammaNestPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Kamma Nest</h1>
      <p className="text-xs text-gray-400 mb-6">Heritage community app</p>
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
        <p className="text-sm font-semibold text-gray-600 mb-1">Minimal integration</p>
        <p className="text-xs text-gray-400">Kamma Nest is a standalone app with minimal Supabase usage. Configure <code className="text-[11px] bg-gray-100 px-1 rounded">SUPABASE_KAMMANEST_URL</code> and <code className="text-[11px] bg-gray-100 px-1 rounded">SUPABASE_KAMMANEST_SERVICE_KEY</code> to enable drill-down.</p>
      </div>
      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-800 mb-1">Phase-2</p>
        <p className="text-xs text-amber-700">Community stats, event RSVP counts, and member growth charts will appear here.</p>
      </div>
    </div>
  )
}
