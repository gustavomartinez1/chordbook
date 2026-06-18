export const runtime = 'edge';

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/shared/components/Navbar';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export const metadata: Metadata = {
  title: {
    default: 'CHORDBOOK — Canciones para tu iglesia',
    template: '%s | CHORDBOOK',
  },
  description:
    'Cancionero digital para músicos de iglesia. Sistema numérico con transposición automática para alabanza y adoración.',
  keywords: [
    'música de iglesia',
    'cancionero digital',
    'sistema numérico',
    'acordes',
    'transposición',
    'alabanza',
    'adoración',
  ],
  openGraph: {
    title: 'CHORDBOOK — Canciones para tu iglesia',
    description:
      'Cancionero digital para músicos de iglesia. Sistema numérico con transposición automática.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'CHORDBOOK',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: 'CHORDBOOK',
  description:
    'Cancionero digital para músicos de iglesia con sistema numérico y transposición automática.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chordbook.vercel.app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ErrorBoundary>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-4 px-6 text-center text-xs text-muted-foreground">
            <p>CHORDBOOK &copy; {new Date().getFullYear()} — Hecho para músicos de iglesia</p>
          </footer>
        </ErrorBoundary>
      </body>
    </html>
  );
}
