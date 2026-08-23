import { createClient, type Client } from '@libsql/client/web'

type DbGlobal = typeof globalThis & { __awaniDb?: Client; __awaniSchemaReady?: boolean; __awaniBarcodeReady?: boolean }

function g(): DbGlobal {
  return globalThis as DbGlobal
}

export function setDbClient(next: Client): void {
  g().__awaniDb = next
  g().__awaniSchemaReady = false
  g().__awaniBarcodeReady = false
}

export function getDb(): Client {
  const existing = g().__awaniDb
  if (existing) return existing
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || url === 'undefined') {
    throw new Error('Turso n’est pas configuré. Ajoutez TURSO_DATABASE_URL et TURSO_AUTH_TOKEN.')
  }
  if (url.startsWith('file:')) {
    const mod = process.getBuiltinModule?.('node:module') as { createRequire: (u: string) => (id: string) => { createClient: (c: { url: string }) => Client } }
    if (!mod?.createRequire) {
      throw new Error('La base fichier n’est disponible qu’en local (Node).')
    }
    const req = mod.createRequire(import.meta.url)
    const { createClient: createFileClient } = req('@libsql/client') as { createClient: (c: { url: string }) => Client }
    const fileClient = createFileClient({ url })
    g().__awaniDb = fileClient
    return fileClient
  }
  if (!authToken) {
    throw new Error('Turso n’est pas configuré. Ajoutez TURSO_DATABASE_URL et TURSO_AUTH_TOKEN.')
  }
  const remote = createClient({ url, authToken })
  g().__awaniDb = remote
  return remote
}

export function authSecret(): string {
  return process.env.AUTH_SECRET || process.env.TURSO_AUTH_TOKEN || 'awani-chawki-dev-secret'
}

export async function ensureSchema(): Promise<Client> {
  const db = getDb()
  if (!g().__awaniSchemaReady) {
    await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      store_name TEXT NOT NULL,
      merchant_name TEXT NOT NULL DEFAULT '',
      whatsapp TEXT NOT NULL DEFAULT '',
      currency TEXT NOT NULL DEFAULT 'MAD',
      currency_symbol TEXT NOT NULL DEFAULT 'DH',
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      address TEXT NOT NULL DEFAULT '',
      username TEXT NOT NULL DEFAULT 'awani',
      password_hash TEXT NOT NULL DEFAULT '',
      delivery_fee REAL NOT NULL DEFAULT 0,
      logo TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      cost REAL NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      images_json TEXT NOT NULL DEFAULT '[]',
      discount_percent REAL NOT NULL DEFAULT 0,
      barcode TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL DEFAULT '',
      items_json TEXT NOT NULL,
      total REAL NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      lat REAL,
      lng REAL,
      status TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      delivery_fee REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      order_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );
  `)
    g().__awaniSchemaReady = true
  }
  if (!g().__awaniBarcodeReady) {
    try {
      await db.execute("ALTER TABLE products ADD COLUMN barcode TEXT NOT NULL DEFAULT ''")
    } catch {
      /* column already exists */
    }
    g().__awaniBarcodeReady = true
  }
  return db
}
