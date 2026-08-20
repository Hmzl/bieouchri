import { createClient, type Client } from '@libsql/client/web'

type DbGlobal = typeof globalThis & { __awaniDb?: Client; __awaniSchemaReady?: boolean }

function g(): DbGlobal {
  return globalThis as DbGlobal
}

export function setDbClient(next: Client): void {
  g().__awaniDb = next
  g().__awaniSchemaReady = false
}

export function getDb(): Client {
  if (g().__awaniDb) return g().__awaniDb
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
    g().__awaniDb = createFileClient({ url })
    return g().__awaniDb
  }
  if (!authToken) {
    throw new Error('Turso n’est pas configuré. Ajoutez TURSO_DATABASE_URL et TURSO_AUTH_TOKEN.')
  }
  g().__awaniDb = createClient({ url, authToken })
  return g().__awaniDb
}

export function authSecret(): string {
  return process.env.AUTH_SECRET || process.env.TURSO_AUTH_TOKEN || 'awani-chawki-dev-secret'
}

export async function ensureSchema(): Promise<Client> {
  const db = getDb()
  if (g().__awaniSchemaReady) return db
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
  `)
  g().__awaniSchemaReady = true
  return db
}
