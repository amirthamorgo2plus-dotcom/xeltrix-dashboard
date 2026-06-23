import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Xeltrix Command',
  description: 'Super-admin dashboard for all Xeltrix apps',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
