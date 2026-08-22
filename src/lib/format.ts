import type { Lang } from '../i18n/translations'

let currentLang: Lang = 'ar'

export function setFormatLocale(lang: Lang): void {
  currentLang = lang
}

function locale(): string {
  return currentLang === 'ar' ? 'ar-MA' : 'fr-FR'
}

function numberLocale(): Intl.NumberFormatOptions {
  return {
    numberingSystem: 'latn',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }
}

export function formatMoney(amount: number, _symbol?: string, _currency?: string): string {
  const formatted = new Intl.NumberFormat('fr-FR', numberLocale()).format(amount)
  return currentLang === 'ar' ? `${formatted} د.م.` : `${formatted} DH`
}

export function formatDateLong(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  const text = new Intl.DateTimeFormat(locale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    numberingSystem: 'latn',
  }).format(d)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatDateShort(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat(locale(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    numberingSystem: 'latn',
  }).format(d)
}

export function formatTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat(locale(), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    numberingSystem: 'latn',
  }).format(d)
}

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (currentLang === 'ar') {
    if (h < 12) return 'صباح الخير'
    return 'مساء الخير'
  }
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'AC'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function mapsUrl(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`
}

export function osmEmbed(lat: number, lng: number): string {
  const d = 0.008
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`
}
