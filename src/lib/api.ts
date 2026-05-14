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
