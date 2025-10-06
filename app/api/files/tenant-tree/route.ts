// app/api/files/tenant-tree/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

type FileRow = {
  name: string
  key: string
  url: string
  size: number
  updated_at?: string
  folder: string // "ACME/teklifler" gibi gösterim için
}

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = user.app_metadata?.tenant_id ?? 1
  const bucket = 'REKLAMPRO'
  const root = `tenants/${tenantId}`

  // Supabase storage.list recursive değil; biz gezeceğiz.
  const queue: string[] = [root]
  const files: FileRow[] = []
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!

  while (queue.length) {
    const path = queue.shift()!
    const { data, error } = await sb.storage.from(bucket).list(path, { limit: 1000 })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    for (const item of data || []) {
      if (item.id === null && item.name && item.created_at === null) {
        // bazı SDK sürümlerinde klasörlerin id/created_at alanları null olabiliyor;
        // item.metadata?.eTag benzeri de olmayabilir. "item.name" + path klasör demektir.
      }
      if (item.name && item.id === undefined && item.metadata === undefined) {
        // Eski tip klasör işareti; yine klasör olarak ele al.
      }

      if (item.name && item.id) {
        // dosya
        const key = `${path}/${item.name}`
        const url = `${base}/storage/v1/object/public/${bucket}/${key}`
        const folder = path.replace(`${root}/`, '') // "ACME/teklifler" vs.
        files.push({
          name: item.name,
          key,
          url,
          size: item.metadata?.size ?? 0,
          updated_at: item.updated_at,
          folder: folder || '(Kök)'
        })
      } else if (item.name && !item.id) {
        // klasör
        queue.push(`${path}/${item.name}`)
      }
    }
  }

  // UI'da gruplamak istersen "folder" alanına göre gruplayabilirsin.
  return NextResponse.json(files)
}
