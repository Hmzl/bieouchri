const INSTALLED_KEY = 'awani-chawki-pwa-installed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallWindow = Window & { __awaniInstall?: BeforeInstallPromptEvent | null }

let deferredPrompt: BeforeInstallPromptEvent | null = null
const promptListeners = new Set<() => void>()

function installWindow(): InstallWindow {
  return window as InstallWindow
}

function setDeferredPrompt(event: BeforeInstallPromptEvent | null): void {
  deferredPrompt = event
  installWindow().__awaniInstall = event
}

export function initInstallCapture(): void {
  const early = installWindow().__awaniInstall
  if (early) setDeferredPrompt(early)

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    setDeferredPrompt(event as BeforeInstallPromptEvent)
    promptListeners.forEach((fn) => fn())
  })
  window.addEventListener('appinstalled', () => {
    setDeferredPrompt(null)
    markAppInstalled()
  })
}

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  if (import.meta.env.DEV) {
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) void reg.unregister()
    })
    return
  }
  void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
}

export function onInstallPromptReady(fn: () => void): () => void {
  promptListeners.add(fn)
  if (deferredPrompt) fn()
  return () => {
    promptListeners.delete(fn)
  }
}

export function consumeInstallPrompt(): BeforeInstallPromptEvent | null {
  const event = deferredPrompt
  setDeferredPrompt(null)
  return event
}

export function hasInstallPrompt(): boolean {
  return Boolean(deferredPrompt)
}

export function markAppInstalled(): void {
  localStorage.setItem(INSTALLED_KEY, '1')
}

export function isLaunchedFromHomeScreen(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if ((navigator as Navigator & { standalone?: boolean }).standalone) return true
  if (document.referrer.startsWith('android-app://')) return true
  return false
}

function takeHomeScreenQuery(): boolean {
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.get('homescreen') !== '1') return false
    url.searchParams.delete('homescreen')
    const search = url.searchParams.toString()
    window.history.replaceState(null, '', `${url.pathname}${search ? `?${search}` : ''}${url.hash}`)
    return true
  } catch {
    return false
  }
}

export function captureInstallState(): boolean {
  if (takeHomeScreenQuery() || isLaunchedFromHomeScreen()) {
    markAppInstalled()
    return true
  }
  return isLaunchedFromHomeScreen()
}

export function isAppInstalled(): boolean {
  return isLaunchedFromHomeScreen()
}

export function rememberIfInstalled(): boolean {
  return captureInstallState()
}

export function installHint(): 'ios' | 'android' {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 'android'
}
