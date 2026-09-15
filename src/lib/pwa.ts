import { DEFAULT_SETTINGS } from './defaults'
import type { Settings } from '../types'

export function pwaDisplayName(settings: Pick<Settings, 'pwaName'>): string {
  const name = (settings.pwaName || '').trim().slice(0, 30)
  return name || DEFAULT_SETTINGS.pwaName
}

function setLink(rel: string, href: string, extra?: Record<string, string>): void {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
  if (extra) {
    for (const [key, value] of Object.entries(extra)) el.setAttribute(key, value)
  }
}

export function applyPwaMeta(settings: Pick<Settings, 'pwaName' | 'pwaIcon'>): void {
  const name = pwaDisplayName(settings)
  document.title = name
  const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]')
  if (appleTitle) appleTitle.setAttribute('content', name)

  const icon = settings.pwaIcon?.trim()
    ? `/api/pwa-icon?s=192&v=${encodeURIComponent(name)}`
    : '/logo-192.png'
  const apple = settings.pwaIcon?.trim()
    ? `/api/pwa-icon?s=apple&v=${encodeURIComponent(name)}`
    : '/apple-touch-icon.png'
  setLink('icon', icon, { type: settings.pwaIcon ? 'image/jpeg' : 'image/png', sizes: '192x192' })
  setLink('apple-touch-icon', apple)
}
