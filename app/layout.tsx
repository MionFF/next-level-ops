import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Next Level Ops',
  description: 'Role-based operations dashboard for a fitness studio',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='h-full'>
      <body className='min-h-full flex flex-col'>{children}</body>
    </html>
  )
}
