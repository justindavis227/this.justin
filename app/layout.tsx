import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'This✱Justin',
  description: 'Personal operating system for Justin Davis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
