import type { AppData, Invoice, Order, OrderStatus, Product, Settings } from '../src/types'
import { buildDemoData, OLD_DEMO_PRODUCT_IDS } from '../src/lib/demo'
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, EMPTY_DATA } from '../src/lib/defaults'
import { uid } from '../src/lib/id'
import { salePrice } from '../src/lib/product'
import { generatePassword, sha256Hex } from './crypto'
import { ensureSchema } from './db'

const DEFAULT_USERNAME = 'awani'
const DEFAULT_PASSWORD = 'chawki'

function num(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function mapProduct(row: Record<string, unknown>): Product {
  const images = parseJson<string[]>(row.images_json, [])
  return {
    id: str(row.id),
    name: str(row.name),
    price: num(row.price),
    cost: num(row.cost),
    quantity: num(row.quantity),
    category: str(row.category),
    description: str(row.description),
    image: str(row.image) || images[0] || '',
    images,
    discountPercent: num(row.discount_percent),
    barcode: str(row.barcode),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  }
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: str(row.id),
    customerName: str(row.customer_name),
    customerPhone: str(row.customer_phone),
    items: parseJson(row.items_json, []),
    total: num(row.total),
    address: str(row.address),
    lat: row.lat == null ? null : num(row.lat),
    lng: row.lng == null ? null : num(row.lng),
    status: str(row.status, 'confirmed') as Order['status'],
    source: str(row.source, 'client') as Order['source'],
    createdAt: str(row.created_at),
    notes: str(row.notes),
    deliveryFee: num(row.delivery_fee),
  }
}

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: str(row.id),
    number: str(row.number),
    orderId: str(row.order_id),
    createdAt: str(row.created_at),
  }
}

function mapSettings(row: Record<string, unknown> | undefined): Settings {
  if (!row) return { ...DEFAULT_SETTINGS }
  return {
    storeName: str(row.store_name, DEFAULT_SETTINGS.storeName),
    merchantName: str(row.merchant_name),
    whatsapp: str(row.whatsapp),
    currency: 'MAD',
    currencySymbol: 'DH',
    lowStockThreshold: Math.max(1, Math.round(num(row.low_stock_threshold, 5))),
    address: str(row.address),
    username: str(row.username, DEFAULT_USERNAME),
    passwordHash: str(row.password_hash),
    deliveryFee: Math.max(0, num(row.delivery_fee)),
    logo: str(row.logo),
  }
}

async function seedIfEmpty(): Promise<void> {
  const db = await ensureSchema()
  const passwordHash = await sha256Hex(DEFAULT_PASSWORD)
  const existing = await db.execute('SELECT COUNT(*) AS n FROM settings')
  if (num(existing.rows[0]?.n) === 0) {
    const s = DEFAULT_SETTINGS
    await db.execute({
      sql: `INSERT INTO settings (id, store_name, merchant_name, whatsapp, currency, currency_symbol, low_stock_threshold, address, username, password_hash, delivery_fee, logo)
            VALUES (1, ?, ?, ?, 'MAD', 'DH', ?, ?, ?, ?, ?, '')`,
      args: [s.storeName, s.merchantName, s.whatsapp, s.lowStockThreshold, s.address, DEFAULT_USERNAME, passwordHash, s.deliveryFee],
    })
  }
  await ensureMerchantUser(passwordHash)
  const users = await db.execute('SELECT COUNT(*) AS n FROM users')
  if (num(users.rows[0]?.n) === 0) {
    await writeDefaultMerchant()
  }
  const cats = await db.execute('SELECT COUNT(*) AS n FROM categories')
  if (num(cats.rows[0]?.n) === 0) {
    await db.batch(
      DEFAULT_CATEGORIES.map((name) => ({ sql: 'INSERT OR IGNORE INTO categories (name) VALUES (?)', args: [name] })),
      'write',
    )
  }
  await syncExampleCatalog()
}

async function syncExampleCatalog(): Promise<void> {
  const db = await ensureSchema()
  const demo = buildDemoData()
  const deletes = OLD_DEMO_PRODUCT_IDS.map((id) => ({ sql: 'DELETE FROM products WHERE id = ?', args: [id] }))
  const inserts = demo.products.map((p) => ({
    sql: `INSERT INTO products (id, name, price, cost, quantity, category, description, image, images_json, discount_percent, barcode, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            price = excluded.price,
            cost = excluded.cost,
            category = excluded.category,
            description = excluded.description,
            image = excluded.image,
            images_json = excluded.images_json,
            discount_percent = excluded.discount_percent,
            barcode = excluded.barcode,
            updated_at = excluded.updated_at`,
    args: [
      p.id,
      p.name,
      p.price,
      p.cost,
      p.quantity,
      p.category,
      p.description,
      p.image,
      JSON.stringify(p.images ?? []),
      p.discountPercent ?? 0,
      p.barcode ?? '',
      p.createdAt,
      p.updatedAt,
    ],
  }))
  await db.batch([...deletes, ...inserts], 'write')
}

async function ensureMerchantUser(passwordHash?: string): Promise<void> {
  const db = await ensureSchema()
  const hash = passwordHash || (await sha256Hex(DEFAULT_PASSWORD))
  await db.execute({
    sql: `INSERT INTO users (id, username, password_hash) VALUES (1, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            username = CASE WHEN TRIM(username) = '' THEN excluded.username ELSE username END,
            password_hash = CASE WHEN password_hash = '' THEN excluded.password_hash ELSE password_hash END`,
    args: [DEFAULT_USERNAME, hash],
  })
  await db.execute({
    sql: `UPDATE settings SET
            username = CASE WHEN TRIM(COALESCE(username, '')) = '' THEN ? ELSE username END,
            password_hash = CASE WHEN COALESCE(password_hash, '') = '' THEN ? ELSE password_hash END
          WHERE id = 1`,
    args: [DEFAULT_USERNAME, hash],
  })
}

async function upsertMerchantUser(username: string, passwordHash: string): Promise<void> {
  const db = await ensureSchema()
  await db.execute({
    sql: `INSERT INTO users (id, username, password_hash) VALUES (1, ?, ?)
          ON CONFLICT(id) DO UPDATE SET username = excluded.username, password_hash = excluded.password_hash`,
    args: [username, passwordHash],
  })
}

async function writeDefaultMerchant(): Promise<void> {
  const db = await ensureSchema()
  const hash = await sha256Hex(DEFAULT_PASSWORD)
  await upsertMerchantUser(DEFAULT_USERNAME, hash)
  await db.execute({
    sql: 'UPDATE settings SET username = ?, password_hash = ? WHERE id = 1',
    args: [DEFAULT_USERNAME, hash],
  })
}

export async function readStore(): Promise<AppData> {
  await seedIfEmpty()
  const db = await ensureSchema()
  const [settingsRes, catRes, prodRes, orderRes, invRes] = await Promise.all([
    db.execute('SELECT * FROM settings WHERE id = 1'),
    db.execute('SELECT name FROM categories ORDER BY name'),
    db.execute('SELECT * FROM products ORDER BY created_at DESC'),
    db.execute('SELECT * FROM orders ORDER BY created_at DESC'),
    db.execute('SELECT * FROM invoices ORDER BY created_at DESC'),
  ])
  return {
    settings: mapSettings(settingsRes.rows[0] as Record<string, unknown> | undefined),
    categories: catRes.rows.map((r) => str(r.name)).filter(Boolean),
    products: prodRes.rows.map((r) => mapProduct(r as Record<string, unknown>)),
    orders: orderRes.rows.map((r) => mapOrder(r as Record<string, unknown>)),
    invoices: invRes.rows.map((r) => mapInvoice(r as Record<string, unknown>)),
  }
}

export function publicStore(data: AppData): AppData {
  return {
    ...data,
    orders: [],
    invoices: [],
    settings: {
      ...data.settings,
      username: '',
      passwordHash: '',
    },
    products: data.products.map((p) => ({ ...p, cost: 0 })),
  }
}

export function merchantStore(data: AppData): AppData {
  return {
    ...data,
    settings: { ...data.settings, passwordHash: '' },
  }
}

export async function verifyLogin(username: string, password: string): Promise<boolean> {
  await seedIfEmpty()
  const db = await ensureSchema()
  const incoming = username.trim().toLowerCase()
  if (!incoming || !password) return false

  const userRes = await db.execute('SELECT username, password_hash FROM users WHERE id = 1')
  const settingsRes = await db.execute('SELECT username, password_hash FROM settings WHERE id = 1')
  const userRow = userRes.rows[0] as Record<string, unknown> | undefined
  const settingsRow = settingsRes.rows[0] as Record<string, unknown> | undefined
  const storedUser = str(userRow?.username || settingsRow?.username, DEFAULT_USERNAME).trim().toLowerCase()
  const storedHash = str(userRow?.password_hash || settingsRow?.password_hash)
  if (incoming !== storedUser) return false
  if (storedHash) return (await sha256Hex(password)) === storedHash
  return password === DEFAULT_PASSWORD
}

export async function saveSettings(input: Settings, newPassword?: string): Promise<Settings> {
  const db = await ensureSchema()
  await seedIfEmpty()
  const current = await readStore()
  let passwordHash = current.settings.passwordHash
  if (newPassword && newPassword.length > 0) {
    if (newPassword.length < 4) throw new Error('Le mot de passe doit contenir au moins 4 caractères.')
    passwordHash = await sha256Hex(newPassword)
  }
  const next: Settings = {
    ...DEFAULT_SETTINGS,
    ...input,
    storeName: input.storeName.trim() || 'Awani Chawki',
    merchantName: input.merchantName.trim(),
    whatsapp: input.whatsapp.trim(),
    address: input.address.trim(),
    username: input.username.trim() || DEFAULT_USERNAME,
    passwordHash,
    currency: 'MAD',
    currencySymbol: 'DH',
    logo: input.logo || '',
    deliveryFee: Math.max(0, Number(input.deliveryFee) || 0),
    lowStockThreshold: Math.max(1, Math.round(Number(input.lowStockThreshold) || 5)),
  }
  await db.execute({
    sql: `UPDATE settings SET store_name=?, merchant_name=?, whatsapp=?, currency='MAD', currency_symbol='DH',
          low_stock_threshold=?, address=?, username=?, password_hash=?, delivery_fee=?, logo=? WHERE id=1`,
    args: [
      next.storeName,
      next.merchantName,
      next.whatsapp,
      next.lowStockThreshold,
      next.address,
      next.username,
      next.passwordHash,
      next.deliveryFee,
      next.logo,
    ],
  })
  await upsertMerchantUser(next.username, next.passwordHash || (await sha256Hex(DEFAULT_PASSWORD)))
  return { ...next, passwordHash: '' }
}

export async function addCategory(name: string): Promise<string[]> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Catégorie invalide')
  const db = await ensureSchema()
  await seedIfEmpty()
  await db.execute({ sql: 'INSERT OR IGNORE INTO categories (name) VALUES (?)', args: [trimmed] })
  const data = await readStore()
  return data.categories
}

export async function upsertProduct(
  input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<Product> {
  const db = await ensureSchema()
  await seedIfEmpty()
  const now = new Date().toISOString()
  const images = input.images ?? []
  const id = input.id || uid('prd')
  const existing = input.id
    ? (await db.execute({ sql: 'SELECT created_at FROM products WHERE id = ?', args: [id] })).rows[0]
    : undefined
  const createdAt = existing ? str(existing.created_at, now) : now
  const product: Product = {
    id,
    name: input.name,
    price: input.price,
    cost: input.cost,
    quantity: input.quantity,
    category: input.category,
    description: input.description,
    image: images[0] ?? '',
    images,
    discountPercent: input.discountPercent,
    barcode: (input.barcode ?? '').replace(/[\s-]/g, '').trim(),
    createdAt,
    updatedAt: now,
  }
  await db.execute({
    sql: `INSERT INTO products (id, name, price, cost, quantity, category, description, image, images_json, discount_percent, barcode, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name=excluded.name, price=excluded.price, cost=excluded.cost, quantity=excluded.quantity,
            category=excluded.category, description=excluded.description, image=excluded.image,
            images_json=excluded.images_json, discount_percent=excluded.discount_percent,
            barcode=excluded.barcode, updated_at=excluded.updated_at`,
    args: [
      product.id,
      product.name,
      product.price,
      product.cost,
      product.quantity,
      product.category,
      product.description,
      product.image,
      JSON.stringify(product.images),
      product.discountPercent,
      product.barcode,
      product.createdAt,
      product.updatedAt,
    ],
  })
  return product
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await ensureSchema()
  await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] })
}

export async function placeOrder(input: {
  customerName: string
  customerPhone: string
  address: string
  lat: number | null
  lng: number | null
  notes?: string
  source: Order['source']
  items: { productId: string; quantity: number }[]
}): Promise<Order> {
  if (input.items.length === 0) throw new Error('err.emptyCart')
  const data = await readStore()
  const lines = input.items.map((line) => {
    const product = data.products.find((p) => p.id === line.productId)
    if (!product) throw new Error('err.missingProduct')
    if (line.quantity > product.quantity) throw new Error(`err.stock:${product.name}`)
    return {
      productId: product.id,
      name: product.name,
      price: salePrice(product),
      cost: product.cost,
      quantity: line.quantity,
    }
  })
  const subtotal = lines.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = input.source === 'client' ? Math.max(0, data.settings.deliveryFee || 0) : 0
  const createdAt = new Date().toISOString()
  const order: Order = {
    id: uid('ord'),
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    items: lines,
    total: subtotal + deliveryFee,
    deliveryFee,
    address: input.address.trim(),
    lat: input.lat,
    lng: input.lng,
    status: 'confirmed',
    source: input.source,
    createdAt,
    notes: input.notes?.trim() ?? '',
  }
  const year = new Date().getFullYear()
  const invoice: Invoice = {
    id: uid('inv'),
    number: `FAC-${year}-${String(data.invoices.length + 1).padStart(4, '0')}`,
    orderId: order.id,
    createdAt,
  }
  const db = await ensureSchema()
  const statements = [
    {
      sql: `INSERT INTO orders (id, customer_name, customer_phone, items_json, total, address, lat, lng, status, source, created_at, notes, delivery_fee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        order.id,
        order.customerName,
        order.customerPhone,
        JSON.stringify(order.items),
        order.total,
        order.address,
        order.lat,
        order.lng,
        order.status,
        order.source,
        order.createdAt,
        order.notes,
        order.deliveryFee,
      ],
    },
    {
      sql: 'INSERT INTO invoices (id, number, order_id, created_at) VALUES (?, ?, ?, ?)',
      args: [invoice.id, invoice.number, invoice.orderId, invoice.createdAt],
    },
    ...lines.map((line) => ({
      sql: 'UPDATE products SET quantity = MAX(0, quantity - ?), updated_at = ? WHERE id = ?',
      args: [line.quantity, createdAt, line.productId],
    })),
  ]
  await db.batch(statements, 'write')
  return order
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const data = await readStore()
  const current = data.orders.find((o) => o.id === id)
  if (!current || current.status === status) return
  const db = await ensureSchema()
  const statements: { sql: string; args: Array<string | number | null> }[] = [
    { sql: 'UPDATE orders SET status = ? WHERE id = ?', args: [status, id] },
  ]
  if (status === 'cancelled' && current.status !== 'cancelled') {
    for (const line of current.items) {
      statements.push({
        sql: 'UPDATE products SET quantity = quantity + ?, updated_at = ? WHERE id = ?',
        args: [line.quantity, new Date().toISOString(), line.productId],
      })
    }
  }
  await db.batch(statements, 'write')
}

export async function loadDemo(): Promise<AppData> {
  const current = await readStore()
  const demo = buildDemoData()
  const merged: AppData = {
    ...demo,
    settings: {
      ...demo.settings,
      username: current.settings.username,
      passwordHash: current.settings.passwordHash,
      logo: current.settings.logo,
      whatsapp: current.settings.whatsapp || demo.settings.whatsapp,
    },
  }
  await writeFullStore(merged)
  return merchantStore(await readStore())
}

export async function resetAll(): Promise<AppData> {
  await writeFullStore(structuredClone(EMPTY_DATA))
  return merchantStore(await readStore())
}

async function writeFullStore(data: AppData): Promise<void> {
  const db = await ensureSchema()
  await db.executeMultiple(`
    DELETE FROM products;
    DELETE FROM orders;
    DELETE FROM invoices;
    DELETE FROM categories;
  `)
  await db.execute({
    sql: `UPDATE settings SET store_name=?, merchant_name=?, whatsapp=?, currency='MAD', currency_symbol='DH',
          low_stock_threshold=?, address=?, username=?, password_hash=?, delivery_fee=?, logo=? WHERE id=1`,
    args: [
      data.settings.storeName,
      data.settings.merchantName,
      data.settings.whatsapp,
      data.settings.lowStockThreshold,
      data.settings.address,
      data.settings.username,
      data.settings.passwordHash,
      data.settings.deliveryFee,
      data.settings.logo,
    ],
  })
  const catStmt = data.categories.map((name) => ({ sql: 'INSERT OR IGNORE INTO categories (name) VALUES (?)', args: [name] }))
  const prodStmt = data.products.map((p) => ({
    sql: `INSERT INTO products (id, name, price, cost, quantity, category, description, image, images_json, discount_percent, barcode, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      p.id,
      p.name,
      p.price,
      p.cost,
      p.quantity,
      p.category,
      p.description,
      p.image,
      JSON.stringify(p.images ?? []),
      p.discountPercent ?? 0,
      p.barcode ?? '',
      p.createdAt,
      p.updatedAt,
    ],
  }))
  const orderStmt = data.orders.map((o) => ({
    sql: `INSERT INTO orders (id, customer_name, customer_phone, items_json, total, address, lat, lng, status, source, created_at, notes, delivery_fee)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      o.id,
      o.customerName,
      o.customerPhone,
      JSON.stringify(o.items),
      o.total,
      o.address,
      o.lat,
      o.lng,
      o.status,
      o.source,
      o.createdAt,
      o.notes,
      o.deliveryFee ?? 0,
    ],
  }))
  const invStmt = data.invoices.map((i) => ({
    sql: 'INSERT INTO invoices (id, number, order_id, created_at) VALUES (?, ?, ?, ?)',
    args: [i.id, i.number, i.orderId, i.createdAt],
  }))
  const all = [...catStmt, ...prodStmt, ...orderStmt, ...invStmt]
  if (all.length > 0) await db.batch(all, 'write')
}

export async function recoverAccess(): Promise<{
  username: string
  password: string
  phone: string
  reset: boolean
  storeName: string
}> {
  const data = await readStore()
  const phone = data.settings.whatsapp
  if (!phone || phone.replace(/\D/g, '').length < 8) {
    throw new Error('no-wa')
  }
  const username = (data.settings.username || DEFAULT_USERNAME).trim()
  const reset = Boolean(data.settings.passwordHash)
  const password = reset ? generatePassword() : DEFAULT_PASSWORD
  if (reset) {
    const passwordHash = await sha256Hex(password)
    const db = await ensureSchema()
    await db.execute({ sql: 'UPDATE settings SET password_hash = ? WHERE id = 1', args: [passwordHash] })
    await upsertMerchantUser(username || DEFAULT_USERNAME, passwordHash)
  }
  return { username, password, phone, reset, storeName: data.settings.storeName || 'Awani Chawki' }
}
