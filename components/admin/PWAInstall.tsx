'use client'

/**
 * PWAInstall
 *
 * Small self-contained widget for the admin sidebar. Handles:
 *   - Registering the service worker (/sw.js)
 *   - Capturing beforeinstallprompt so we can show our own install button
 *     instead of relying on Chrome's opaque menu
 *   - Showing an "Add to Home Screen" hint on iOS Safari, which doesn't
 *     fire the prompt event
 *   - Hiding itself entirely when already running standalone (installed)
 *
 * Designed to sit as a compact tile at the bottom of the admin sidebar.
 * On mobile, gets rendered inline just above the version marker.
 */

import { useCallback, useEffect, useState } from 'react'

// Chromium fires this with an event that has a .prompt() method — not in the
// standard DOM types yet, so we type it ourselves.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InstallState =
  | 'checking'
  | 'installed'       // already running standalone
  | 'installable'    // browser fired beforeinstallprompt, we have a handle
  | 'ios'            // Safari on iOS — needs manual instructions
  | 'unsupported'    // no PWA install path on this browser
  | 'ios-hint'       // user tapped, showing the iOS instructions

export default function PWAInstall() {
  const [state, setState] = useState<InstallState>('checking')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  // Register the service worker once on mount. Skip in dev (Next writes the
  // static files only in prod builds, so no point hitting /sw.js locally).
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // Register on all environments — production is what actually installs, but
    // Chrome DevTools > Application > Service Workers still shows registration
    // in dev too if you build & run locally. Cheap.
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        // Service worker registration is a nice-to-have. If it fails (e.g.
        // strict CSP, quota exceeded, dev-only file 404) we still want the
        // admin to work.
      })
  }, [])

  // Detect the install state
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already running as installed PWA?
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (standalone) {
      setState('installed')
      return
    }

    // iOS Safari never fires beforeinstallprompt. Detect it so we can show
    // the "Add to Home Screen" instructions instead.
    const ua = window.navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua)
    if (isIOS && isSafari) {
      setState('ios')
      return
    }

    // Listen for the install prompt. If it doesn't arrive within a reasonable
    // window we assume the browser is not going to offer install (unsupported
    // browser, criteria not met, already dismissed too often).
    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setState('installable')
    }
    const onInstalled = () => setState('installed')

    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)

    // If we never hear from the browser after 4s, degrade gracefully.
    const timeout = window.setTimeout(() => {
      setState(prev => (prev === 'checking' ? 'unsupported' : prev))
    }, 4000)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
      window.clearTimeout(timeout)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferred) return
    try {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === 'accepted') {
        setState('installed')
      }
    } catch {
      // User closed the prompt or something errored — leave button available
      // in case they want to retry.
    } finally {
      setDeferred(null)
    }
  }, [deferred])

  // Don't render at all when already installed — no point advertising install
  // to someone who did it.
  if (state === 'installed') return null

  // Common tile styling — subtle so it doesn't compete with primary navigation
  const tile =
    'w-full rounded-xl border border-gold/15 bg-gradient-to-br from-gold/[0.08] to-transparent px-3 py-3 text-left transition-colors hover:border-gold/30'

  if (state === 'installable') {
    return (
      <button onClick={handleInstall} className={tile} type="button">
        <div className="flex items-center gap-2.5">
          <span className="text-gold" aria-hidden="true">
            {/* download-to-device glyph */}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-heading tracking-wide">Install App</p>
            <p className="text-white/40 text-[10px] font-body truncate">Adds Crunchtyme to your home screen</p>
          </div>
        </div>
      </button>
    )
  }

  if (state === 'ios') {
    return (
      <button onClick={() => setState('ios-hint')} className={tile} type="button">
        <div className="flex items-center gap-2.5">
          <span className="text-gold" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-heading tracking-wide">Install on iPhone</p>
            <p className="text-white/40 text-[10px] font-body truncate">Tap to see how</p>
          </div>
        </div>
      </button>
    )
  }

  if (state === 'ios-hint') {
    return (
      <div className="w-full rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.12] to-transparent p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-gold text-xs font-heading tracking-wider uppercase">Add to Home Screen</p>
          <button onClick={() => setState('ios')} className="text-white/40 hover:text-white/70 text-lg leading-none" aria-label="Close">
            ×
          </button>
        </div>
        <ol className="text-white/70 text-[11px] font-body space-y-1.5 list-decimal list-inside">
          <li>Tap the <span className="text-gold">Share</span> button at the bottom of Safari</li>
          <li>Scroll down and tap <span className="text-gold">Add to Home Screen</span></li>
          <li>Tap <span className="text-gold">Add</span> in the top right</li>
        </ol>
      </div>
    )
  }

  // 'checking' or 'unsupported': no tile — silent
  return null
}
