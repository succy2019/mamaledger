const BASE_URL = '/api'

function getToken(): string | null {
  return localStorage.getItem('ml_token')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  register: (phone: string, pin: string) =>
    request<{ token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    }),

  login: (phone: string, pin: string) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    }),

  syncEntries: (entries: unknown[]) =>
    request<{ synced: number }>('/entries/sync', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    }),
}

export function setToken(token: string) {
  localStorage.setItem('ml_token', token)
}

export function clearToken() {
  localStorage.removeItem('ml_token')
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('ml_token')
}

// ── AI helpers ─────────────────────────────────────────────────────────────

export interface AIParsedEntry {
  item: string
  quantity: number
  price: number
  type: 'sale' | 'credit' | 'expense' | 'stock' | 'payback'
  customer: string | null
}

/**
 * Sends a recorded audio Blob to the Whisper STT endpoint and returns the
 * transcribed text.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const token = getToken()
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')

  const res = await fetch(`${BASE_URL}/ai/transcribe`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Transcription failed: HTTP ${res.status}`)
  }

  const data = await res.json() as { transcript?: string; error?: string }
  if (data.error) throw new Error(data.error)
  return (data.transcript ?? '').trim()
}

/**
 * Sends a transcript string to the LLaMA endpoint and returns a structured
 * ledger entry object.
 */
export async function parseTranscriptWithAI(transcript: string): Promise<AIParsedEntry> {
  const token = getToken()

  const res = await fetch(`${BASE_URL}/ai/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ transcript }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `AI parse failed: HTTP ${res.status}`)
  }

  const data = await res.json() as AIParsedEntry & { error?: string }
  if (data.error) throw new Error(data.error)
  return data
}
