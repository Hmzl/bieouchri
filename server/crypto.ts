function toB64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fromB64Url(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4))
  const bin = atob(value.replaceAll('-', '+').replaceAll('_', '/') + pad)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function signToken(username: string, secret: string, hours = 12): Promise<string> {
  const payload = JSON.stringify({ u: username, exp: Date.now() + hours * 3600000 })
  const body = toB64Url(new TextEncoder().encode(payload))
  const key = await hmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  return `${body}.${toB64Url(new Uint8Array(sig))}`
}

export async function verifyToken(token: string, secret: string): Promise<string | null> {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const key = await hmacKey(secret)
  const ok = await crypto.subtle.verify('HMAC', key, asBuffer(fromB64Url(sig)), new TextEncoder().encode(body))
  if (!ok) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64Url(body))) as { u?: string; exp?: number }
    if (!payload.u || !payload.exp || payload.exp < Date.now()) return null
    return payload.u
  } catch {
    return null
  }
}

export function generatePassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}
