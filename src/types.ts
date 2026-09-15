export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type OrderSource = 'client' | 'pos'

export interface Product {
  id: string
  name: string
  price: number
  cost: number
  quantity: number
  category: string
  description: string
  image: string
  images: string[]
  discountPercent: number
  barcode: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  cost: number
  quantity: number
}

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  total: number
  address: string
  lat: number | null
  lng: number | null
  status: OrderStatus
  source: OrderSource
  createdAt: string
  notes: string
  deliveryFee: number
}

export interface Invoice {
  id: string
  number: string
  orderId: string
  createdAt: string
}

export interface Settings {
  storeName: string
  merchantName: string
  whatsapp: string
  currency: string
  currencySymbol: string
  lowStockThreshold: number
  address: string
  username: string
  passwordHash: string
  deliveryFee: number
  logo: string
  pwaName: string
  pwaIcon: string
}

export interface AppData {
  products: Product[]
  orders: Order[]
  invoices: Invoice[]
  categories: string[]
  settings: Settings
}
