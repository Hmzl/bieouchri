import { DEFAULT_SETTINGS } from '../src/lib/defaults'
import { readStore } from './store'

export function pwaDisplayName(name?: string): string {
  const trimmed = (name || '').trim().slice(0, 30)
  return trimmed || DEFAULT_SETTINGS.pwaName
}

function parseDataUrl(dataUrl: string): { mime: string; body: Uint8Array } | null {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/)
  if (!match) return null
  try {
    const binary = atob(match[2])
    const body = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) body[i] = binary.charCodeAt(i)
    return { mime: match[1], body }
  } catch {
    return null
  }
}

export async function manifestResponse(req: Request): Promise<Response> {
  const data = await readStore()
  const origin = new URL(req.url).origin
  const name = pwaDisplayName(data.settings.pwaName)
  const custom = Boolean(data.settings.pwaIcon)
  const icon = (size: string, purpose: 'any' | 'maskable') => ({
    src: custom ? `${origin}/api/pwa-icon?s=${size}` : `${origin}/logo-${size === 'maskable' ? 'maskable' : size}.png`,
    sizes: size === '192' ? '192x192' : '512x512',
    type: custom ? 'image/jpeg' : 'image/png',
    purpose,
  })
  const manifest = {
    name,
    short_name: name,
    description: data.settings.storeName || name,
    id: '/',
    start_url: '/?homescreen=1',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fff8f1',
    theme_color: '#12b5a8',
    lang: 'ar',
    prefer_related_applications: false,
    icons: custom
      ? [
          { src: `${origin}/api/pwa-icon?s=192`, sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
          { src: `${origin}/api/pwa-icon?s=512`, sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
          { src: `${origin}/api/pwa-icon?s=maskable`, sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' },
        ]
      : [
          icon('192', 'any'),
          icon('512', 'any'),
          {
            src: `${origin}/logo-maskable.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
  }
  return new Response(JSON.stringify(manifest), {
    headers: {
      'content-type': 'application/manifest+json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export async function pwaIconResponse(req: Request): Promise<Response> {
  const data = await readStore()
  const parsed = data.settings.pwaIcon ? parseDataUrl(data.settings.pwaIcon) : null
  if (!parsed) {
    const size = new URL(req.url).searchParams.get('s')
    const fallback =
      size === '512' || size === 'maskable' ? '/logo-512.png' : size === 'apple' ? '/apple-touch-icon.png' : '/logo-192.png'
    return Response.redirect(new URL(fallback, req.url), 302)
  }
  return new Response(parsed.body, {
    headers: {
      'content-type': parsed.mime,
      'cache-control': 'no-store',
    },
  })
}
