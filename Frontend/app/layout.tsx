import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'FlowFi - Control Financiero para tu Negocio',
  description: 'FlowFi es una plataforma de control financiero diseñada para pequeños negocios. Registra ingresos, gastos y visualiza tu flujo de caja en tiempo real.',
  generator: 'v0.app',
  keywords: ['finanzas', 'control financiero', 'ingresos', 'gastos', 'flujo de caja', 'pymes', 'negocios'],
}

export const viewport: Viewport = {
  themeColor: '#0F766E',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
