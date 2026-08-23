import type { AppData, Invoice, Order, Product } from '../types'
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './defaults'
import { uid } from './id'

export const OLD_DEMO_PRODUCT_IDS = [
  'prd_casserole',
  'prd_assiettes',
  'prd_vase',
  'prd_ustensiles',
  'prd_bougeoir',
  'prd_sauteuse',
  'prd_bols',
  'prd_nappe',
]

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
      id: 'prd_mug',
      name: 'Mug isotherme personnalisé',
      price: 29,
      cost: 12,
      quantity: 18,
      category: 'Cuisine',
      description: 'Mug isotherme blanc, anse et couvercle coulissant. Personnalisation prénom.',
      image: '/demo/mug-isotherme.jpg',
      images: ['/demo/mug-isotherme.jpg'],
      barcode: '6111252900014',
      discountPercent: 0,
      createdAt: daysAgo(20),
      updatedAt: now,
    },
    {
      id: 'prd_plateau',
      name: 'Plateau déco vases et bougie',
      price: 45,
      cost: 18,
      quantity: 10,
      category: 'Décoration',
      description: 'Plateau en bois, vases beige et rose, bougie parfumée et coquillages.',
      image: '/demo/plateau-deco.jpg',
      images: ['/demo/plateau-deco.jpg'],
      barcode: '6111254500021',
      discountPercent: 0,
      createdAt: daysAgo(18),
      updatedAt: now,
    },
    {
      id: 'prd_pivoines',
      name: 'Bouquet de pivoines, vase or',
      price: 75,
      cost: 32,
      quantity: 8,
      category: 'Décoration',
      description: 'Bouquet de pivoines roses et ivoire dans un vase verre à liserés dorés.',
      image: '/demo/pivoines.jpg',
      images: ['/demo/pivoines.jpg'],
      barcode: '6111257500038',
      discountPercent: 10,
      createdAt: daysAgo(16),
      updatedAt: now,
    },
    {
      id: 'prd_tables_blanc',
      name: 'Tables gigognes blanc et bois',
      price: 119,
      cost: 54,
      quantity: 6,
      category: 'Décoration',
      description: 'Duo de tables gigognes : plateau blanc laqué et plateau bois, pieds bois.',
      image: '/demo/tables-blanc.jpg',
      images: ['/demo/tables-blanc.jpg'],
      barcode: '6111251190045',
      discountPercent: 0,
      createdAt: daysAgo(12),
      updatedAt: now,
    },
    {
      id: 'prd_tables_noir',
      name: 'Tables gigognes noires',
      price: 145,
      cost: 68,
      quantity: 5,
      category: 'Décoration',
      description: 'Set de deux tables basses gigognes, plateau organique et pieds noirs.',
      image: '/demo/tables-noir.jpg',
      images: ['/demo/tables-noir.jpg'],
      barcode: '6111251450052',
      discountPercent: 0,
      createdAt: daysAgo(10),
      updatedAt: now,
    },
    {
      id: 'prd_bistro',
      name: 'Salon de jardin pliant 3 pièces',
      price: 159,
      cost: 78,
      quantity: 4,
      category: 'Autre',
      description: 'Table et deux chaises pliantes en bois, pour balcon ou terrasse.',
      image: '/demo/salon-jardin.jpg',
      images: ['/demo/salon-jardin.jpg'],
      barcode: '6111251590069',
      discountPercent: 5,
      createdAt: daysAgo(8),
      updatedAt: now,
    },
    {
      id: 'prd_carafes',
      name: 'Duo de carafes thermiques or',
      price: 170,
      cost: 82,
      quantity: 7,
      category: 'Table',
      description: 'Deux carafes blanches, or et cristal, présentées sur plateau doré.',
      image: '/demo/carafes.jpg',
      images: ['/demo/carafes.jpg'],
      barcode: '6111251700078',
      discountPercent: 0,
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
    total: items.reduce((s, i) => s + i.price * i.quantity, 0) + (source === 'client' ? 15 : 0),
    deliveryFee: source === 'client' ? 15 : 0,
    address: source === 'pos' ? 'Retrait en magasin' : 'Casablanca',
    lat: source === 'client' ? 33.5731 : null,
    lng: source === 'client' ? -7.5898 : null,
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
        { productId: 'prd_carafes', name: 'Duo de carafes thermiques or', price: 170, cost: 82, quantity: 1 },
        { productId: 'prd_mug', name: 'Mug isotherme personnalisé', price: 29, cost: 12, quantity: 2 },
      ],
      daysAgo(0, 9),
    ),
    order(
      'ord_demo2',
      'Jean Mensah',
      '0506070809',
      [{ productId: 'prd_pivoines', name: 'Bouquet de pivoines, vase or', price: 75, cost: 32, quantity: 1 }],
      daysAgo(1, 16),
    ),
    order(
      'ord_demo3',
      'Client magasin',
      '',
      [
        { productId: 'prd_plateau', name: 'Plateau déco vases et bougie', price: 45, cost: 18, quantity: 1 },
        { productId: 'prd_mug', name: 'Mug isotherme personnalisé', price: 29, cost: 12, quantity: 1 },
      ],
      daysAgo(2, 12),
      'pos',
    ),
    order(
      'ord_demo4',
      'Fatou Diallo',
      '0102030405',
      [
        { productId: 'prd_tables_blanc', name: 'Tables gigognes blanc et bois', price: 119, cost: 54, quantity: 1 },
        { productId: 'prd_pivoines', name: 'Bouquet de pivoines, vase or', price: 75, cost: 32, quantity: 1 },
      ],
      daysAgo(8, 14),
    ),
    order(
      'ord_demo5',
      'Koffi Yao',
      '0708091011',
      [{ productId: 'prd_bistro', name: 'Salon de jardin pliant 3 pièces', price: 159, cost: 78, quantity: 1 }],
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
      whatsapp: '212600000000',
      address: 'Showroom Maison & Cuisine',
      deliveryFee: 15,
    },
  }
}
