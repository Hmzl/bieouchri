export const AUTH_KEY = 'awani-chawki-auth'
export const DEFAULT_USERNAME = 'awani'
export const DEFAULT_PASSWORD = 'chawki'

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'
const EASTERN_ARABIC = '۰۱۲۳۴۵۶۷۸۹'

export function normalizeLoginText(value: string, kind: 'username' | 'password' = 'password'): string {
  let out = value.normalize('NFC')
  out = out.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
  out = out.replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC.indexOf(digit)))
  out = out.replace(/[۰-۹]/g, (digit) => String(EASTERN_ARABIC.indexOf(digit)))
  out = out.trim()
  return kind === 'username' ? out.toLowerCase() : out
}

export function generatePassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isAuthStored(): boolean {
  return localStorage.getItem(AUTH_KEY) === '1'
}

export function setAuthStored(on: boolean): void {
  if (on) localStorage.setItem(AUTH_KEY, '1')
  else localStorage.removeItem(AUTH_KEY)
}

export async function verifyCredentials(
  username: string,
  password: string,
  storedUser: string,
  storedHash: string,
): Promise<boolean> {
  const expectedUser = normalizeLoginText(storedUser || DEFAULT_USERNAME, 'username')
  if (normalizeLoginText(username, 'username') !== expectedUser) return false
  const incomingPassword = normalizeLoginText(password, 'password')
  if (storedHash) {
    const incoming = await hashPassword(incomingPassword)
    return incoming === storedHash
  }
  return incomingPassword === DEFAULT_PASSWORD
}
