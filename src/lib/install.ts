const INSTALLED_KEY = 'awani-chawki-installed'

function navStandalone(): boolean {
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}

export function markAppInstalled(): void {
  localStorage.setItem(INSTALLED_KEY, '1')
}

export function isAppInstalled(): boolean {
  if (localStorage.getItem(INSTALLED_KEY) === '1') return true
  if (navStandalone()) return true
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return true
  if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true
  if (document.referrer.startsWith('android-app://')) return true
  return false
}

export function rememberIfInstalled(): boolean {
  if (!isAppInstalled()) return false
  markAppInstalled()
  return true
}

export function isChromiumInstallable(): boolean {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return false
  return /Chrome|Chromium|Edg|SamsungBrowser/i.test(ua)
}
