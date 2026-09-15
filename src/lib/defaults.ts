import type { AppData, Settings } from '../types'

export const DEFAULT_CATEGORIES = [
  'Cuisine',
  'Ustensiles',
  'Table',
  'Décoration',
  'Textile',
  'Électroménager',
  'Autre',
]

export const DEFAULT_SETTINGS: Settings = {
  storeName: 'Awani Chawki',
  merchantName: 'Awani Chawki',
  whatsapp: '',
  currency: 'MAD',
  currencySymbol: 'DH',
  lowStockThreshold: 5,
  address: '',
  username: 'awani',
  passwordHash: '',
  deliveryFee: 0,
  logo: '',
  pwaName: 'Market',
  pwaIcon: '',
}

export const EMPTY_DATA: AppData = {
  products: [],
  orders: [],
  invoices: [],
  categories: [...DEFAULT_CATEGORIES],
  settings: { ...DEFAULT_SETTINGS },
}
