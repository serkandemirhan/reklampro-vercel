// app/api/files/tenant-tree/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

type FileRow = {
  name: string
  key: string
  url: string       // signed url (1 saat)
  size: number
  updated_at?: string
  folder: string    // "ACME/teklifler" gibi
}

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = user.app_metadata?.tenant_id ?? 1
  const bucket = 'REKLAMPRO'
  const root = `Tenant${tenantId}`

  const queue: string[] = [root]
  const keys: string[] = []
  const meta: Record<string, { name: string; size: number; updated_at?: string; folder: string }> = {}

  while (queue.length) {
    const path = queue.shift()!
    const { data, error } = await sb.storage.from(bucket).list(path, { limit: 1000 })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    for (const item of data || []) {
      // item.id varsa dosyadır; yoksa klasördür
      if (item.id) {
        const key = `${path}/${item.name}`
        const folder = path.replace(`${root}/`, '') || 'Tenant1'
        keys.push(key)
        meta[key] = {
          name: item.name,
          size: item.metadata?.size ?? 0,
          updated_at: item.updated_at,
          folder
        }
      } else {
        queue.push(`${path}/${item.name}`)
      }
    }
  }

  // 1 saatlik imzalı linkleri toplu üret
  const { data: signed, error: signErr } = await sb.storage
    .from(bucket)
    .createSignedUrls(keys, 3600)
  if (signErr) return NextResponse.json({ error: signErr.message }, { status: 400 })

  const rows: FileRow[] = (signed || []).map(s => ({
    key: s.path,
    url: s.signedUrl!,
    name: meta[s.path].name,
    size: meta[s.path].size,
    updated_at: meta[s.path].updated_at,
    folder: meta[s.path].folder
  }))

  return NextResponse.json(rows)
}
