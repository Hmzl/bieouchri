const INSTALLED_KEY = 'awani-chawki-pwa-installed'

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
  return localStorage.getItem(INSTALLED_KEY) === '1'
}

export function isAppInstalled(): boolean {
  if (localStorage.getItem(INSTALLED_KEY) === '1') return true
  return isLaunchedFromHomeScreen()
}

export function rememberIfInstalled(): boolean {
  return captureInstallState()
}

export function canUseNativeInstallPrompt(): boolean {
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return false
  if (!window.isSecureContext) return false
  return /Chrome|Chromium|Edg|SamsungBrowser/i.test(navigator.userAgent)
}

export function installHint(): 'ios' | 'android' {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 'android'
}

export function checkRelatedAppsInstalled(): Promise<boolean> {
  const nav = navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<unknown[]>
  }
  if (!nav.getInstalledRelatedApps) return Promise.resolve(false)
  return nav.getInstalledRelatedApps().then((apps) => apps.length > 0)
}
