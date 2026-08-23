import { mkdirSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { loadEnv, type Plugin } from 'vite'
import { handleApi } from './router'

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host || 'localhost'
  const url = `http://${host}${req.url || '/'}`
  const method = req.method || 'GET'
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue
    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }
  if (method === 'GET' || method === 'HEAD') {
    return new Request(url, { method, headers })
  }
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const body = Buffer.concat(chunks)
  return new Request(url, { method, headers, body: body.length ? body : undefined })
}

function applyEnv(mode: string): void {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.TURSO_DATABASE_URL) process.env.TURSO_DATABASE_URL = env.TURSO_DATABASE_URL
  if (env.TURSO_AUTH_TOKEN) process.env.TURSO_AUTH_TOKEN = env.TURSO_AUTH_TOKEN
  if (env.AUTH_SECRET) process.env.AUTH_SECRET = env.AUTH_SECRET
}

function envFlag(name: string): string {
  const value = process.env[name]
  return !value || value === 'undefined' ? '' : value
}

function useLocalSqlite(): void {
  const remoteUrl = envFlag('TURSO_DATABASE_URL')
  const remoteToken = envFlag('TURSO_AUTH_TOKEN')
  if (remoteUrl.startsWith('libsql:') || remoteUrl.startsWith('https:')) {
    if (remoteToken) return
  }
  const dir = resolve(process.cwd(), 'data')
  mkdirSync(dir, { recursive: true })
  const fileUrl = `file:${resolve(dir, 'awani.db').replace(/\\/g, '/')}`
  process.env.TURSO_DATABASE_URL = fileUrl
  process.env.TURSO_AUTH_TOKEN = 'local-dev'
  process.env.TURSO_LOCAL = '1'
  if (!envFlag('AUTH_SECRET')) process.env.AUTH_SECRET = 'awani-chawki-dev-secret'
  const glob = globalThis as { __awaniDb?: unknown; __awaniSchemaReady?: boolean; __awaniBarcodeReady?: boolean }
  delete glob.__awaniDb
  glob.__awaniSchemaReady = false
  glob.__awaniBarcodeReady = false
}

export function tursoApiPlugin(): Plugin {
  return {
    name: 'turso-api',
    config(_, { mode }) {
      applyEnv(mode)
    },
    configureServer(server) {
      applyEnv(server.config.mode)
      useLocalSqlite()
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          next()
          return
        }
        try {
          useLocalSqlite()
          const request = await toWebRequest(req)
          const response = await handleApi(request)
          await writeNodeResponse(res, response)
        } catch (e) {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'server_error' }))
        }
      })
    },
  }
}

async function writeNodeResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  const buf = Buffer.from(await response.arrayBuffer())
  res.end(buf)
}
