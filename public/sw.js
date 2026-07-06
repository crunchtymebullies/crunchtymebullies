// ─────────────────────────────────────────────────────────────
// Crunchtyme Admin — Service Worker
//
// Scope: /go (admin only, matches manifest scope). Customers never see
// this SW because it's registered from the admin surface.
//
// Bump CACHE_VERSION when you ship a manifest/icon change OR want to
// force every client to drop its cached assets on next load.
// ─────────────────────────────────────────────────────────────

const CACHE_VERSION = 'v1';
const CACHE_NAME    = `crunchtyme-admin-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Escape hatch: page can post {type:'SKIP_WAITING'} to activate a fresh SW
// without user having to close every tab. Cheap insurance against the "stale
// broken client survives reloads" failure mode.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function shouldBypassCache(url) {
  const u = new URL(url);
  return (
    // All API surfaces (never cache — always live)
    u.pathname.startsWith('/api/') ||
    // Storefront/checkout — customer surface, not us; leave the browser
    // free to cache/revalidate normally without interference.
    u.pathname.startsWith('/shop') ||
    u.pathname.startsWith('/pay') ||
    // Third-party runtime origins
    u.hostname.endsWith('.medusajs.com') ||
    u.hostname.endsWith('.stripe.com') ||
    u.hostname.endsWith('.printful.com') ||
    u.hostname.endsWith('.sanity.io') ||
    u.hostname.endsWith('.fly.dev') ||
    u.hostname.endsWith('.supabase.co') ||
    u.hostname.endsWith('.resend.com') ||
    // Analytics/monitoring pings
    u.hostname.endsWith('.vercel-insights.com')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (shouldBypassCache(request.url)) return;
  const url = new URL(request.url);

  // Only cache under the admin scope. Never cache marketing/shop HTML —
  // we don't want to accidentally serve stale product pages.
  if (!url.pathname.startsWith('/go') && !url.pathname.startsWith('/_next/static/') && !url.pathname.startsWith('/icons/')) {
    return;
  }

  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    // Network-only for HTML with graceful offline fallback. We deliberately
    // never cache-substitute a different HTML page — that lets stale broken
    // shells survive reloads.
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then(
          (c) => c || new Response(
            '<!doctype html><meta charset=utf-8><title>Offline — Crunchtyme Admin</title><body style="font-family:system-ui;background:#0a0806;color:#f0e6d2;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;margin:0"><div style="max-width:22rem;padding:2rem"><h1 style="font-weight:300;letter-spacing:.05em">Offline</h1><p style="opacity:.7;line-height:1.5">Can\u2019t reach the server. Check your connection and reload.</p></div>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        )
      )
    );
    return;
  }

  // Static assets — stale-while-revalidate flavor: serve from cache if we have it,
  // fetch fresh in the background to update.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        });
      })
    );
    return;
  }
});

// ─────────────────────────────────────────────────────────────
// PUSH NOTIFICATIONS
// The VAPID keys are already in Vercel env vars (NEXT_PUBLIC_VAPID_PUBLIC_KEY
// + VAPID_PRIVATE_KEY). Server-side wiring (subscribe/send endpoints) isn't
// built yet, but the SW is ready for it — a payload arriving at /push will
// display cleanly.
// ─────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let payload = { title: 'Crunchtyme', body: 'You have a new notification.', url: '/go/admin' };
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() }; }
    catch { payload.body = event.data.text() || payload.body; }
  }

  const options = {
    body: payload.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: payload.tag ?? 'crunchtyme-default',
    renotify: !!payload.renotify,
    requireInteraction: !!payload.requireInteraction,
    data: { url: payload.url ?? '/go/admin', ...(payload.data ?? {}) },
    vibrate: [120, 60, 120],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/go/admin';

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      const clientUrl = new URL(client.url);
      if (clientUrl.pathname.startsWith('/go')) {
        await client.focus();
        if ('navigate' in client) {
          try { await client.navigate(targetUrl); } catch { /* same-origin restriction */ }
        }
        return;
      }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});

// Gracefully swallow expiry events until we build the subscribe endpoint.
// If we drop the handler entirely the browser will log an error, so keep
// this stub in place.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    try {
      await self.registration.pushManager.subscribe(
        event.oldSubscription?.options ?? { userVisibleOnly: true }
      );
      // TODO(push): when /api/push/subscribe exists, POST { endpoint, keys } here.
    } catch {
      // User will need to re-enable manually
    }
  })());
});
