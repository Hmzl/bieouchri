import type { Order } from '../types'
import { formatMoney, mapsUrl } from './format'
import { translate, type Lang } from '../i18n/translations'

export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function buildOrderMessage(
  order: Order,
  storeName: string,
  symbol: string,
  currency: string,
  lang: Lang = 'fr',
): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars)
  const money = (n: number) => formatMoney(n, symbol, currency)
  const ref = order.id.replace('ord_', 'CMD-').toUpperCase()
  const fee = order.deliveryFee ?? 0
  const subtotal = order.total - fee
  const lines: string[] = []
  lines.push(t('wa.newOrder', { store: storeName }))
  lines.push('')
  lines.push(t('wa.no', { ref }))
  lines.push(t('wa.client', { name: order.customerName }))
  lines.push(t('wa.phone', { phone: order.customerPhone }))
  lines.push('')
  lines.push(t('wa.products'))
  for (const item of order.items) {
    const lineTotal = money(item.price * item.quantity)
    lines.push(`• ${item.name} × ${item.quantity} — ${lineTotal}`)
  }
  lines.push('')
  if (fee > 0) {
    lines.push(t('wa.subtotal', { n: money(subtotal) }))
    lines.push(t('wa.delivery', { n: money(fee) }))
  }
  lines.push(t('wa.total', { n: money(order.total) }))
  lines.push('')
  lines.push(t('wa.address'))
  lines.push(order.address || t('wa.noAddress'))
  if (order.lat != null && order.lng != null) {
    lines.push(t('wa.gps', { n: `${order.lat.toFixed(6)}, ${order.lng.toFixed(6)}` }))
    lines.push(mapsUrl(order.lat, order.lng))
  }
  if (order.notes.trim()) {
    lines.push('')
    lines.push(t('wa.note', { n: order.notes.trim() }))
  }
  lines.push('')
  lines.push(`— ${storeName}`)
  return lines.join('\n')
}

export function buildAccessMessage(
  storeName: string,
  username: string,
  password: string,
  lang: Lang = 'fr',
): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars)
  return [
    t('wa.accessTitle', { store: storeName }),
    '',
    t('wa.accessUser', { n: username }),
    t('wa.accessPass', { n: password }),
    '',
    t('wa.accessKeep'),
  ].join('\n')
}

export function openWhatsApp(phone: string, text: string): boolean {
  const num = digitsOnly(phone)
  if (num.length < 8) return false
  const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
