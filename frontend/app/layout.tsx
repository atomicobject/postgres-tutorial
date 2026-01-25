import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Postgres Workshop',
  description: 'Next.js + PostgreSQL workshop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
