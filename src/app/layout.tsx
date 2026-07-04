import type { Metadata, Viewport } from 'next';
import { Inter, Lora } from 'next/font/google';
import { siteUrl } from '@/lib/env';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Quran Teacher',
    template: '%s | Quran Teacher',
  },
  description: 'A lightweight lesson and session tracker for Quran teachers.',
  applicationName: 'Quran Teacher',
  openGraph: {
    title: 'Quran Teacher',
    description: 'A lightweight lesson and session tracker for Quran teachers.',
    siteName: 'Quran Teacher',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quran Teacher',
    description: 'A lightweight lesson and session tracker for Quran teachers.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Quran Teacher',
  },
  icons: {
    apple: '/apple-touch-icon.svg',
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#2B6873',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

/** Root HTML document for the app. */
export default function RootLayout({
  children,
}: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} h-full`}>
      <body className="min-h-full text-ink antialiased">{children}</body>
    </html>
  );
}
