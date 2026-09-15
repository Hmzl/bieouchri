import { authSecret } from './db'
import { signToken, verifyToken } from './crypto'
import {
  addCategory,
  deleteProduct,
  loadDemo,
  merchantStore,
  placeOrder,
  publicStore,
  readStore,
  recoverAccess,
  resetAll,
  saveSettings,
  updateOrderStatus,
  upsertProduct,
  verifyLogin,
} from './store'
import type { OrderStatus, Product, Settings } from '../src/types'
import { manifestResponse, pwaIconResponse } from './pwa'

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function pathOf(url: URL): string {
  return url.pathname.replace(/\/+$/, '') || '/'
}

function isPath(path: string, ...names: string[]): boolean {
  return names.includes(path)
}

async function bodyOf<T>(req: Request): Promise<T> {
  return (await req.json()) as T
}

async function merchantUser(req: Request): Promise<string | null> {
  const header = req.headers.get('authorization') || ''
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
  if (!token) return null
  return verifyToken(token, authSecret())
}

export async function handleApi(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = pathOf(url)
  const method = req.method.toUpperCase()

  try {
    if (method === 'GET' && isPath(path, '/api/health', '/api')) {
      return json({ ok: true })
    }

    if (method === 'GET' && path === '/api/store') {
      return json(publicStore(await readStore()))
    }

    if (method === 'GET' && path === '/api/manifest') {
      return manifestResponse(req)
    }

    if (method === 'GET' && path === '/api/pwa-icon') {
      return pwaIconResponse(req)
    }

    if (method === 'POST' && isPath(path, '/api/login', '/api/auth/login')) {
      const { username, password } = await bodyOf<{ username?: string; password?: string }>(req)
      if (!username || !password || !(await verifyLogin(username, password))) {
        return json({ error: 'login.error' }, 401)
      }
      const data = await readStore()
      const token = await signToken(data.settings.username || username, authSecret())
      return json({ token, data: merchantStore(data) })
    }

    if (method === 'POST' && isPath(path, '/api/recover', '/api/auth/recover')) {
      try {
        const recovered = await recoverAccess()
        return json(recovered)
      } catch (e) {
        if (e instanceof Error && e.message === 'no-wa') return json({ error: 'login.forgotNoWa' }, 400)
        throw e
      }
    }

    if (method === 'POST' && path === '/api/orders') {
      const input = await bodyOf<{
        customerName: string
        customerPhone: string
        address: string
        lat: number | null
        lng: number | null
        notes?: string
        source: 'client' | 'pos'
        items: { productId: string; quantity: number }[]
      }>(req)
      if (input.source === 'pos') {
        const user = await merchantUser(req)
        if (!user) return json({ error: 'unauthorized' }, 401)
      }
      const order = await placeOrder(input)
      return json({ order, data: input.source === 'pos' ? merchantStore(await readStore()) : publicStore(await readStore()) })
    }

    const user = await merchantUser(req)
    if (!user) return json({ error: 'unauthorized' }, 401)

    if (method === 'GET' && isPath(path, '/api/merchant-store', '/api/merchant/store')) {
      return json(merchantStore(await readStore()))
    }

    if (method === 'PUT' && isPath(path, '/api/merchant-settings', '/api/merchant/settings')) {
      const input = await bodyOf<{ settings: Settings; password?: string }>(req)
      const settings = await saveSettings(input.settings, input.password)
      return json({ settings, data: merchantStore(await readStore()) })
    }

    if (method === 'POST' && isPath(path, '/api/merchant-categories', '/api/merchant/categories')) {
      const { name } = await bodyOf<{ name: string }>(req)
      const categories = await addCategory(name)
      return json({ categories })
    }

    if (method === 'POST' && isPath(path, '/api/merchant-products', '/api/merchant/products')) {
      const input = await bodyOf<Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }>(req)
      const product = await upsertProduct(input)
      return json({ product, data: merchantStore(await readStore()) })
    }

    const productDelete = path.match(/^\/api\/merchant\/products\/([^/]+)$/)
    if (method === 'DELETE' && (path === '/api/merchant-products' || productDelete)) {
      const id = url.searchParams.get('id') || (productDelete ? decodeURIComponent(productDelete[1]) : '')
      if (!id) return json({ error: 'id manquant' }, 400)
      await deleteProduct(id)
      return json({ data: merchantStore(await readStore()) })
    }

    const orderPatch = path.match(/^\/api\/merchant\/orders\/([^/]+)$/)
    if (method === 'PATCH' && (path === '/api/merchant-orders' || orderPatch)) {
      const { status, id: bodyId } = await bodyOf<{ status: OrderStatus; id?: string }>(req)
      const id = bodyId || url.searchParams.get('id') || (orderPatch ? decodeURIComponent(orderPatch[1]) : '')
      if (!id) return json({ error: 'id manquant' }, 400)
      await updateOrderStatus(id, status)
      return json({ data: merchantStore(await readStore()) })
    }

    if (method === 'POST' && isPath(path, '/api/merchant-demo', '/api/merchant/demo')) {
      return json(await loadDemo())
    }

    if (method === 'POST' && isPath(path, '/api/merchant-reset', '/api/merchant/reset')) {
      return json(await resetAll())
    }

    return json({ error: 'not_found' }, 404)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'server_error'
    const status =
      message.startsWith('err.') ||
      message.startsWith('form.err') ||
      message.includes('invalide') ||
      message.includes('caractères')
        ? 400
        : 500
    return json({ error: message }, status)
  }
}
