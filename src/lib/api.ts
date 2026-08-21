import type { AppData, Order, OrderStatus, Product, Settings } from '../types'
import { getToken } from './storage'

async function request<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  if (auth) {
    const token = getToken()
    if (token) headers.set('authorization', `Bearer ${token}`)
  }
  const res = await fetch(path, { ...init, headers })
  const type = res.headers.get('content-type') || ''
  if (!type.includes('json')) {
    throw new Error('API indisponible. Relancez le serveur (npm run dev).')
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return data
}

export function fetchPublicStore(): Promise<AppData> {
  return request<AppData>('/api/store')
}

export function fetchMerchantStore(): Promise<AppData> {
  return request<AppData>('/api/merchant/store', {}, true)
}

export function loginRequest(username: string, password: string): Promise<{ token: string; data: AppData }> {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function recoverRequest(): Promise<{
  username: string
  password: string
  phone: string
  reset: boolean
  storeName: string
}> {
  return request('/api/recover', { method: 'POST', body: '{}' })
}

export function placeOrderRequest(
  input: {
    customerName: string
    customerPhone: string
    address: string
    lat: number | null
    lng: number | null
    notes?: string
    source: Order['source']
    items: { productId: string; quantity: number }[]
  },
  auth: boolean,
): Promise<{ order: Order; data: AppData }> {
  return request('/api/orders', { method: 'POST', body: JSON.stringify(input) }, auth)
}

export function saveSettingsRequest(settings: Settings, password?: string): Promise<{ data: AppData }> {
  return request('/api/merchant/settings', { method: 'PUT', body: JSON.stringify({ settings, password }) }, true)
}

export function addCategoryRequest(name: string): Promise<{ categories: string[] }> {
  return request('/api/merchant/categories', { method: 'POST', body: JSON.stringify({ name }) }, true)
}

export function upsertProductRequest(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<{ data: AppData }> {
  return request('/api/merchant/products', { method: 'POST', body: JSON.stringify(product) }, true)
}

export function deleteProductRequest(id: string): Promise<{ data: AppData }> {
  return request(`/api/merchant/products/${encodeURIComponent(id)}`, { method: 'DELETE' }, true)
}

export function updateOrderStatusRequest(id: string, status: OrderStatus): Promise<{ data: AppData }> {
  return request(`/api/merchant/orders/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) }, true)
}

export function loadDemoRequest(): Promise<AppData> {
  return request('/api/merchant/demo', { method: 'POST', body: '{}' }, true)
}

export function resetAllRequest(): Promise<AppData> {
  return request('/api/merchant/reset', { method: 'POST', body: '{}' }, true)
}
