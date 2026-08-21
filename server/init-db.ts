import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadDotEnv(): void {
  const path = resolve(process.cwd(), '.env')
  if (!existsSync(path)) return
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i < 1) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadDotEnv()

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('Créez un fichier .env avec TURSO_DATABASE_URL et TURSO_AUTH_TOKEN (voir .env.example).')
  process.exit(1)
}

try {
  const { loadDemo, readStore } = await import('./store')
  const data = process.argv.includes('--demo') ? await loadDemo() : await readStore()
  console.log(`Base prête : ${data.settings.storeName}`)
  console.log(`- ${data.categories.length} catégories`)
  console.log(`- ${data.products.length} produits`)
  console.log(`- ${data.orders.length} commandes`)
  console.log('Connexion commerçant : awani / chawki')
} catch (e) {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
}
