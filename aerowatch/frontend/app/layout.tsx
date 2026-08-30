import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AeroWatch — Weather Intelligence C2 Center',
  description: 'AI-driven Operational Weather Intelligence Command & Control Center (SIH26078)',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0D1117] text-[#F0F6FC] antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
