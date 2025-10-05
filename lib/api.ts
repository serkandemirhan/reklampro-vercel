
import { supabase } from './supabase'

export const API_BASE = '' // same origin

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  }
  const { data: { session } } = await supabase.auth.getSession();
  const tok = session?.access_token;
  if (tok) headers['Authorization'] = `Bearer ${tok}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
