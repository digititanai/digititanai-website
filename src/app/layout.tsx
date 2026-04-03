import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono, Orbitron } from 'next/font/google'
import '@/styles/globals.css'
import Providers from '@/components/layout/Providers'
import { HeadCodeInjection, BodyCodeInjection } from '@/components/layout/CodeInjection'
import ThemeProvider from '@/components/layout/ThemeProvider'
import DataPreloader from '@/components/layout/DataPreloader'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const orbitron = Orbitron({
  variable: '--font-logo',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'DigiTitan AI | Premium Digital Marketing & MarTech Consulting',
  description:
    'Elite marketing strategist and MarTech architect. Transforming brands through precision-driven campaigns, intelligent automation, and bespoke growth frameworks.',
  keywords: [
    'digital marketing consultant',
    'martech specialist',
    'marketing automation',
    'growth strategy',
    'DigiTitan AI',
  ],
  authors: [{ name: 'DigiTitan AI' }],
  openGraph: {
    title: 'DigiTitan AI | Premium Digital Marketing & MarTech Consulting',
    description:
      'Elite marketing strategist and MarTech architect. Transforming brands through precision-driven campaigns.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadCodeInjection />
      </head>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${orbitron.variable} antialiased bg-[#0a0f1a] text-slate-200 min-h-screen`}>
        <DataPreloader />
        <BodyCodeInjection />
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
