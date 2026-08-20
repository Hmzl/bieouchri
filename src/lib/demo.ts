import type { AppData, Invoice, Order, Product } from '../types'
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './defaults'
import { uid } from './id'

function daysAgo(n: number, hour = 11): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, 20, 0, 0)
  return d.toISOString()
}

export function buildDemoData(): AppData {
  const now = new Date().toISOString()
  const products: Product[] = [
    {
      id: 'prd_casserole',
      name: 'Casserole dorée 24 cm',
      price: 28500,
      cost: 14200,
      quantity: 12,
      category: 'Cuisine',
      description: 'Casserole en acier inoxydable, finition or brossé, couvercle inclus.',
      image: '',
      images: [],
      discountPercent: 15,
      createdAt: daysAgo(20),
      updatedAt: now,
    },
    {
      id: 'prd_assiettes',
      name: 'Assiettes noires liseré or',
      price: 18000,
      cost: 8200,
      quantity: 8,
      category: 'Table',
      description: 'Service de 6 assiettes en céramique noire, bordure dorée.',
      image: '',
      images: [],
      discountPercent: 0,
      createdAt: daysAgo(18),
      updatedAt: now,
    },
    {
      id: 'prd_vase',
      name: 'Vase hexagonal or',
      price: 12500,
      cost: 5400,
      quantity: 6,
      category: 'Décoration',
      description: 'Vase noir à motif nid d’abeille doré, branches décoratives incluses.',
      image: '',
      images: [],
      discountPercent: 10,
      createdAt: daysAgo(16),
      updatedAt: now,
    },
    {
      id: 'prd_ustensiles',
      name: 'Set ustensiles & pot',
      price: 9500,
      cost: 3800,
      quantity: 3,
      category: 'Ustensiles',
      description: 'Porte-ustensiles noir avec fouet, spatule et cuillère dorés.',
      image: '',
      images: [],
      discountPercent: 0,
      createdAt: daysAgo(12),
      updatedAt: now,
    },
    {
      id: 'prd_bougeoir',
      name: 'Bougeoir géométrique',
      price: 7200,
      cost: 2900,
      quantity: 15,
      category: 'Décoration',
      description: 'Bougeoir cylindrique ajouré, finition or, pièce unique.',
      image: '',
      images: [],
      discountPercent: 0,
      createdAt: daysAgo(10),
      updatedAt: now,
    },
    {
      id: 'prd_sauteuse',
      name: 'Sauteuse or 20 cm',
      price: 22000,
      cost: 11000,
      quantity: 0,
      category: 'Cuisine',
      description: 'Sauteuse à manche, intérieur antiadhésif, extérieur or.',
      image: '',
      images: [],
      discountPercent: 20,
      createdAt: daysAgo(8),
      updatedAt: now,
    },
    {
      id: 'prd_bols',
      name: 'Bols noirs liseré or',
      price: 8900,
      cost: 3600,
      quantity: 18,
      category: 'Table',
      description: 'Lot de 4 bols en grès noir, rebord doré à la main.',
      image: '',
      images: [],
      discountPercent: 0,
      createdAt: daysAgo(6),
      updatedAt: now,
    },
    {
      id: 'prd_nappe',
      name: 'Nappe lin ivoire',
      price: 15000,
      cost: 6800,
      quantity: 9,
      category: 'Textile',
      description: 'Nappe en lin lavé, 150 × 250 cm, ourlets soignés.',
      image: '',
      images: [],
      discountPercent: 25,
      createdAt: daysAgo(4),
      updatedAt: now,
    },
  ]

  const order = (
    id: string,
    name: string,
    phone: string,
    items: Order['items'],
    createdAt: string,
    source: Order['source'] = 'client',
    status: Order['status'] = 'completed',
  ): Order => ({
    id,
    customerName: name,
    customerPhone: phone,
    items,
    total: items.reduce((s, i) => s + i.price * i.quantity, 0) + (source === 'client' ? 25 : 0),
    deliveryFee: source === 'client' ? 25 : 0,
    address: source === 'pos' ? 'Retrait en magasin' : 'Cocody, Abidjan',
    lat: source === 'client' ? 5.35995 : null,
    lng: source === 'client' ? -4.00826 : null,
    status,
    source,
    createdAt,
    notes: '',
  })

  const orders: Order[] = [
    order(
      'ord_demo1',
      'Awa Kouassi',
      '0701020304',
      [
        { productId: 'prd_casserole', name: 'Casserole dorée 24 cm', price: 28500, cost: 14200, quantity: 1 },
        { productId: 'prd_bols', name: 'Bols noirs liseré or', price: 8900, cost: 3600, quantity: 2 },
      ],
      daysAgo(0, 9),
    ),
    order(
      'ord_demo2',
      'Jean Mensah',
      '0506070809',
      [{ productId: 'prd_vase', name: 'Vase hexagonal or', price: 12500, cost: 5400, quantity: 1 }],
      daysAgo(1, 16),
    ),
    order(
      'ord_demo3',
      'Client magasin',
      '',
      [
        { productId: 'prd_bougeoir', name: 'Bougeoir géométrique', price: 7200, cost: 2900, quantity: 2 },
        { productId: 'prd_nappe', name: 'Nappe lin ivoire', price: 15000, cost: 6800, quantity: 1 },
      ],
      daysAgo(2, 12),
      'pos',
    ),
    order(
      'ord_demo4',
      'Fatou Diallo',
      '0102030405',
      [
        { productId: 'prd_assiettes', name: 'Assiettes noires liseré or', price: 18000, cost: 8200, quantity: 1 },
        { productId: 'prd_ustensiles', name: 'Set ustensiles & pot', price: 9500, cost: 3800, quantity: 1 },
      ],
      daysAgo(8, 14),
    ),
    order(
      'ord_demo5',
      'Koffi Yao',
      '0708091011',
      [{ productId: 'prd_casserole', name: 'Casserole dorée 24 cm', price: 28500, cost: 14200, quantity: 1 }],
      daysAgo(15, 10),
    ),
  ]

  const invoices: Invoice[] = orders.map((o, i) => ({
    id: uid('inv'),
    number: `FAC-${new Date(o.createdAt).getFullYear()}-${String(i + 1).padStart(4, '0')}`,
    orderId: o.id,
    createdAt: o.createdAt,
  }))

  return {
    products,
    orders,
    invoices,
    categories: [...new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category)])],
    settings: {
      ...DEFAULT_SETTINGS,
      storeName: 'Awani Chawki',
      merchantName: 'Awani',
      whatsapp: '2250700000000',
      address: 'Showroom Maison & Cuisine',
      deliveryFee: 25,
    },
  }
}
