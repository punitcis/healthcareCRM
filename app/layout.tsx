import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'CrisisLink — Helpline CRM',
  description: 'Piattaforma di gestione per linee d\'ascolto psicologico H24',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className="h-full">
      <body className="h-full bg-slate-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
