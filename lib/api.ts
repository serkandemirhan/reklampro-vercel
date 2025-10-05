// lib/api.ts
import { supabase } from '@/lib/supabase'

/** Aynı origin kullanıyoruz; gerekirse burayı '/api' ön-ekiyle de verebilirsin. */
export const API_BASE = '' // örn: '' veya '' bırak (fetch('/api/...'))

/** JSON istekler için ortak helper */
export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  }

  // Supabase oturumu varsa Bearer ekle (SSR için middleware zaten cookie senkronize ediyor)
  const { data: { session } } = await supabase.auth.getSession()
  const tok = session?.access_token
  if (tok) headers['Authorization'] = `Bearer ${tok}`

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const j = await res.json()
      if (j?.error) msg = j.error
    } catch { /* text veya boş olabilir */ }
    throw new Error(msg)
  }

  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return (await res.text()) as any
}

/** Dosya upload gibi FormData isteyen istekler için helper (Content-Type başlığını belirtme!) */
export async function apiUpload<T = any>(path: string, form: FormData, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> || {}) }
  const { data: { session } } = await supabase.auth.getSession()
  const tok = session?.access_token
  if (tok) headers['Authorization'] = `Bearer ${tok}`

  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body: form, headers, ...opts })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try { const j = await res.json(); if (j?.error) msg = j.error } catch {}
    throw new Error(msg)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return (await res.text()) as any
}
