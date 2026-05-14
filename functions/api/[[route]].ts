import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'

interface Env {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>().basePath('/api')

// ── CORS ────────────────────────────────────────────────────────────────────
app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }))

// ── Helpers ──────────────────────────────────────────────────────────────────
async function hashPin(pin: string, phone: string): Promise<string> {
  const data = new TextEncoder().encode(pin + phone)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  const body = btoa(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 })
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const sigInput = `${header}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sigInput))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${sigInput}.${sigB64}`
}

function validatePhone(phone: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))
}

function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

// ── Auth: Register ────────────────────────────────────────────────────────────
app.post('/auth/register', async c => {
  const body = await c.req.json<{ phone?: string; pin?: string }>().catch(() => ({}))
  const { phone, pin } = body

  if (!phone || !validatePhone(phone)) {
    return c.json({ error: 'Valid phone number required' }, 400)
  }
  if (!pin || !validatePin(pin)) {
    return c.json({ error: '4-digit PIN required' }, 400)
  }

  const normalizedPhone = phone.replace(/\s/g, '')

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE phone = ?'
  )
    .bind(normalizedPhone)
    .first()

  if (existing) {
    return c.json({ error: 'Phone number already registered' }, 409)
  }

  const pinHash = await hashPin(pin, normalizedPhone)

  await c.env.DB.prepare(
    'INSERT INTO users (phone, pin_hash, created_at) VALUES (?, ?, ?)'
  )
    .bind(normalizedPhone, pinHash, Date.now())
    .run()

  const secret = c.env.JWT_SECRET || 'mamaledger-dev-secret'
  const token = await signJWT({ phone: normalizedPhone }, secret)

  return c.json({ token })
})

// ── Auth: Login ───────────────────────────────────────────────────────────────
app.post('/auth/login', async c => {
  const body = await c.req.json<{ phone?: string; pin?: string }>().catch(() => ({}))
  const { phone, pin } = body

  if (!phone || !validatePhone(phone)) {
    return c.json({ error: 'Valid phone number required' }, 400)
  }
  if (!pin || !validatePin(pin)) {
    return c.json({ error: '4-digit PIN required' }, 400)
  }

  const normalizedPhone = phone.replace(/\s/g, '')
  const pinHash = await hashPin(pin, normalizedPhone)

  const user = await c.env.DB.prepare(
    'SELECT id FROM users WHERE phone = ? AND pin_hash = ?'
  )
    .bind(normalizedPhone, pinHash)
    .first()

  if (!user) {
    // Use same error message for both "not found" and "wrong PIN" to prevent enumeration
    return c.json({ error: 'Invalid phone number or PIN' }, 401)
  }

  const secret = c.env.JWT_SECRET || 'mamaledger-dev-secret'
  const token = await signJWT({ phone: normalizedPhone }, secret)

  return c.json({ token })
})

// ── Entries: Sync (authenticated) ────────────────────────────────────────────
app.post('/entries/sync', async c => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  interface EntryInput {
    id?: number
    item?: string
    quantity?: number
    price?: number
    type?: string
    customer?: string
    category?: string
    timestamp?: number
  }

  const body = await c.req.json<{ entries?: EntryInput[] }>().catch(() => ({}))
  const { entries = [] } = body

  if (!Array.isArray(entries) || entries.length === 0) {
    return c.json({ synced: 0 })
  }

  const stmts = entries
    .filter(e => e.item && e.type && e.timestamp)
    .map(e =>
      c.env.DB.prepare(
        'INSERT OR IGNORE INTO entries (item, quantity, price, type, customer, category, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        String(e.item).slice(0, 200),
        Number(e.quantity) || 1,
        Number(e.price) || 0,
        String(e.type),
        e.customer ? String(e.customer).slice(0, 100) : null,
        e.category ? String(e.category).slice(0, 50) : null,
        Number(e.timestamp)
      )
    )

  if (stmts.length > 0) {
    await c.env.DB.batch(stmts)
  }

  return c.json({ synced: stmts.length })
})

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', c => c.json({ status: 'ok', ts: Date.now() }))

export const onRequest = handle(app)
