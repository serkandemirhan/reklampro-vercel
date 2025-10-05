export async function api<T=any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(opts.headers as any || {}) }
  const res = await fetch(path, { ...opts, headers })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const j = await res.json()
      if (j?.error) msg = j.error
    } catch {}
    throw new Error(msg)
  }
  const ct = res.headers.get('content-type') || ''
  return (ct.includes('application/json') ? res.json() : (res.text() as any)) as Promise<T>
}
