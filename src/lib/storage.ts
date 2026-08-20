import type { AppData } from '../types'
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, EMPTY_DATA } from './defaults'
import { normalizeProduct } from './product'

export { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, EMPTY_DATA }
export const CART_KEY = 'awani-chawki-cart'
export const TOKEN_KEY = 'awani-chawki-token'
export const TOKEN_AT_KEY = 'awani-chawki-token-at'
export const SESSION_MS = 12 * 60 * 60 * 1000

export function loadCart(): { productId: string; quantity: number }[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as { productId: string; quantity: number }[]) : []
  } catch {
    return []
  }
}

export function saveCart(cart: { productId: string; quantity: number }[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

function decodeTokenExp(token: string): number | null {
  const body = token.split('.')[0]
  if (!body) return null
  try {
    const pad = body.length % 4 === 0 ? '' : '='.repeat(4 - (body.length % 4))
    const json = atob(body.replaceAll('-', '+').replaceAll('_', '/') + pad)
    const payload = JSON.parse(json) as { exp?: number }
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

export function isSessionActive(): boolean {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return false
  const exp = decodeTokenExp(token)
  if (exp != null && exp <= Date.now()) return false
  let started = Number(localStorage.getItem(TOKEN_AT_KEY) || 0)
  if (!started) {
    localStorage.setItem(TOKEN_AT_KEY, String(Date.now()))
    started = Date.now()
  }
  return Date.now() - started < SESSION_MS
}

export function sessionRemainingMs(): number {
  if (!isSessionActive()) return 0
  const token = localStorage.getItem(TOKEN_KEY) ?? ''
  const exp = decodeTokenExp(token)
  const started = Number(localStorage.getItem(TOKEN_AT_KEY) || Date.now())
  const untilAt = started + SESSION_MS
  const untilExp = exp ?? untilAt
  return Math.max(0, Math.min(untilAt, untilExp) - Date.now())
}

export function getToken(): string {
  if (!isSessionActive()) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_AT_KEY)
    return ''
  }
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(TOKEN_AT_KEY, String(Date.now()))
  } else {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_AT_KEY)
  }
}

export function normalizeStore(data: Partial<AppData>): AppData {
  return {
    products: (data.products ?? []).map(normalizeProduct),
    orders: (data.orders ?? []).map((o) => ({ ...o, deliveryFee: o.deliveryFee ?? 0 })),
    invoices: data.invoices ?? [],
    categories:
      data.categories && data.categories.length > 0 ? data.categories : [...DEFAULT_CATEGORIES],
    settings: {
      ...DEFAULT_SETTINGS,
      ...data.settings,
      currency: 'MAD',
      currencySymbol: 'DH',
      passwordHash: '',
      logo: data.settings?.logo ?? '',
    },
  }
}
