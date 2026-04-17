const BASE_URL = 'http://localhost:5000/api'

function getToken(): string | null {
  return localStorage.getItem('access_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  
  const text = await res.text()

  let data: any

  try {
    data = JSON.parse(text)
  } catch (err) {
    console.error('❌ Non-JSON response from backend:')
    console.error(text) 

    throw new Error(`Server returned non-JSON response (status ${res.status})`)
  }

  
  if (!res.ok) {
    console.error('❌ API Error:', data)
    throw new Error(data?.error || `Request failed: ${res.status}`)
  }

  return data as T
}

export const api = {
  get:   <T>(path: string) => request<T>(path),

  post:  <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body ?? {}),
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body ?? {}),
    }),
}