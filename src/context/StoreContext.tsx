import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppData, CartItem, Order, Product, Settings } from '../types'
import { EMPTY_DATA } from '../lib/defaults'
import { getToken, loadCart, saveCart, setToken, normalizeStore, sessionRemainingMs } from '../lib/storage'
import {
  addCategoryRequest,
  deleteProductRequest,
  fetchMerchantStore,
  fetchPublicStore,
  loadDemoRequest,
  loginRequest,
  placeOrderRequest,
  recoverRequest,
  resetAllRequest,
  saveSettingsRequest,
  updateOrderStatusRequest,
  upsertProductRequest,
} from '../lib/api'
import { buildAccessMessage, openWhatsApp } from '../lib/whatsapp'

interface StoreContextValue {
  data: AppData
  cart: CartItem[]
  isMerchant: boolean
  loading: boolean
  error: string
  refresh: () => Promise<void>
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  saveSettings: (settings: Settings, newPassword?: string) => Promise<void>
  updateCredentials: (username: string, newPassword?: string) => Promise<void>
  addCategory: (name: string) => Promise<void>
  upsertProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<string>
  deleteProduct: (id: string) => Promise<void>
  addToCart: (productId: string, quantity?: number) => void
  setCartQty: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  placeOrder: (input: {
    customerName: string
    customerPhone: string
    address: string
    lat: number | null
    lng: number | null
    notes?: string
    source: Order['source']
    items?: { productId: string; quantity: number }[]
  }) => Promise<Order>
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>
  loadDemo: () => Promise<void>
  resetAll: () => Promise<void>
  recoverViaWhatsApp: (lang: 'fr' | 'ar') => Promise<{ ok: true; reset: boolean } | { ok: false; reason: 'no-wa' | 'wa-fail' }>
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA)
  const [cart, setCart] = useState<CartItem[]>(() => loadCart())
  const [isMerchant, setIsMerchant] = useState(() => Boolean(getToken()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setError('')
    try {
      const token = getToken()
      if (token) {
        try {
          const merchant = await fetchMerchantStore()
          setData(normalizeStore(merchant))
          setIsMerchant(true)
          return
        } catch {
          setToken(null)
          setIsMerchant(false)
        }
      }
      const pub = await fetchPublicStore()
      setData(normalizeStore(pub))
      setIsMerchant(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Turso')
    }
  }, [])

  useEffect(() => {
    void refresh().finally(() => setLoading(false))
  }, [refresh])

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const result = await loginRequest(username, password)
      setToken(result.token)
      setData(normalizeStore(result.data))
      setIsMerchant(true)
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : ''
      if (message === 'login.error') return false
      throw e instanceof Error ? e : new Error('login.unavailable')
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setIsMerchant(false)
    void fetchPublicStore()
      .then((pub) => setData(normalizeStore(pub)))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!isMerchant) return
    const remaining = sessionRemainingMs()
    if (remaining <= 0) {
      logout()
      return
    }
    const timer = window.setTimeout(() => logout(), remaining)
    const onResume = () => {
      if (sessionRemainingMs() <= 0) logout()
    }
    document.addEventListener('visibilitychange', onResume)
    window.addEventListener('focus', onResume)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onResume)
      window.removeEventListener('focus', onResume)
    }
  }, [isMerchant, logout])

  const saveSettings = useCallback(async (settings: Settings, newPassword?: string) => {
    const result = await saveSettingsRequest(settings, newPassword)
    setData(normalizeStore(result.data))
  }, [])

  const updateCredentials = useCallback(
    async (username: string, newPassword?: string) => {
      await saveSettings({ ...data.settings, username }, newPassword)
    },
    [data.settings, saveSettings],
  )

  const addCategory = useCallback(async (name: string) => {
    const result = await addCategoryRequest(name)
    setData((prev) => ({ ...prev, categories: result.categories }))
  }, [])

  const upsertProduct = useCallback(async (input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const result = await upsertProductRequest(input)
    setData(normalizeStore(result.data))
    return input.id || result.data.products[0]?.id || ''
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    const result = await deleteProductRequest(id)
    setData(normalizeStore(result.data))
    setCart((prev) => prev.filter((c) => c.productId !== id))
  }, [])

  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      setCart((prev) => {
        const product = data.products.find((p) => p.id === productId)
        if (!product || product.quantity <= 0) return prev
        const found = prev.find((c) => c.productId === productId)
        const next = Math.min((found?.quantity ?? 0) + quantity, product.quantity)
        if (next <= 0) return prev.filter((c) => c.productId !== productId)
        if (found) return prev.map((c) => (c.productId === productId ? { ...c, quantity: next } : c))
        return [...prev, { productId, quantity: next }]
      })
    },
    [data.products],
  )

  const setCartQty = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((c) => c.productId !== productId)
      return prev.map((c) => (c.productId === productId ? { ...c, quantity } : c))
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const placeOrder = useCallback(
    async (input: {
      customerName: string
      customerPhone: string
      address: string
      lat: number | null
      lng: number | null
      notes?: string
      source: Order['source']
      items?: { productId: string; quantity: number }[]
    }) => {
      const rawItems = input.items ?? cart
      const result = await placeOrderRequest(
        {
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          address: input.address,
          lat: input.lat,
          lng: input.lng,
          notes: input.notes,
          source: input.source,
          items: rawItems,
        },
        input.source === 'pos' || isMerchant,
      )
      setData(normalizeStore(result.data))
      if (!input.items) setCart([])
      return result.order
    },
    [cart, isMerchant],
  )

  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    const result = await updateOrderStatusRequest(id, status)
    setData(normalizeStore(result.data))
  }, [])

  const loadDemo = useCallback(async () => {
    const next = await loadDemoRequest()
    setData(normalizeStore(next))
    setCart([])
  }, [])

  const resetAll = useCallback(async () => {
    const next = await resetAllRequest()
    setData(normalizeStore(next))
    setCart([])
    setToken(null)
    setIsMerchant(false)
  }, [])

  const recoverViaWhatsApp = useCallback(async (lang: 'fr' | 'ar') => {
    try {
      const recovered = await recoverRequest()
      const opened = openWhatsApp(
        recovered.phone,
        buildAccessMessage(recovered.storeName, recovered.username, recovered.password, lang),
        'same',
      )
      if (!opened) return { ok: false as const, reason: 'wa-fail' as const }
      return { ok: true as const, reset: recovered.reset }
    } catch (e) {
      const message = e instanceof Error ? e.message : ''
      if (message.includes('forgotNoWa') || message === 'no-wa') {
        return { ok: false as const, reason: 'no-wa' as const }
      }
      return { ok: false as const, reason: 'wa-fail' as const }
    }
  }, [])

  const value = useMemo(
    () => ({
      data,
      cart,
      isMerchant,
      loading,
      error,
      refresh,
      login,
      logout,
      saveSettings,
      updateCredentials,
      addCategory,
      upsertProduct,
      deleteProduct,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      placeOrder,
      updateOrderStatus,
      loadDemo,
      resetAll,
      recoverViaWhatsApp,
    }),
    [
      data,
      cart,
      isMerchant,
      loading,
      error,
      refresh,
      login,
      logout,
      saveSettings,
      updateCredentials,
      addCategory,
      upsertProduct,
      deleteProduct,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      placeOrder,
      updateOrderStatus,
      loadDemo,
      resetAll,
      recoverViaWhatsApp,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
