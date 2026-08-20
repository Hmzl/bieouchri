export const AUTH_KEY = 'awani-chawki-auth'
export const DEFAULT_USERNAME = 'awani'
export const DEFAULT_PASSWORD = 'chawki'

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
  const expectedUser = (storedUser || DEFAULT_USERNAME).trim().toLowerCase()
  if (username.trim().toLowerCase() !== expectedUser) return false
  if (storedHash) {
    const incoming = await hashPassword(password)
    return incoming === storedHash
  }
  return password === DEFAULT_PASSWORD
}
