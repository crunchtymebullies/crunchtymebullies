import type { MetadataRoute } from 'next'

/**
 * PWA Web App Manifest for the Crunchtyme admin console.
 *
 * Scope is deliberately `/go` (not `/`) so the installed app opens straight
 * into the admin surface — customers shouldn't install "the shop" as an app,
 * that's a Chrome tab job. Start URL is `/go/admin` so returning to the app
 * lands you on the dashboard, not a landing page.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Crunchtyme Admin',
    short_name: 'Crunchtyme',
    description:
      'Crunchtyme Bullies — operations console: shop, dogs, orders, design studio, inbox.',
    id: '/go',
    start_url: '/go/admin',
    scope: '/go',
    display: 'standalone',
    orientation: 'portrait-primary',
    theme_color: '#0a0806',
    background_color: '#0a0806',
    categories: ['business', 'productivity', 'shopping'],
    icons: [
      { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png' },
      { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
