import type { MetadataRoute } from 'next';

/** Web app manifest used by iOS/Android install flows. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quran Teacher',
    short_name: 'Quran',
    description: 'Lesson scheduling and session tracking for Quran teachers.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F3EFE2',
    theme_color: '#2B6873',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
