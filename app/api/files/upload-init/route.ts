
// app/api/files/upload-init/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

/**
 * Beklenen body:
 * {
 *   customer_name: string,   // örn: "ACME"
 *   subfolder?: string,      // örn: "teklifler" (opsiyonel)
 *   filename: string         // orijinal dosya adı
 * }
 */
export async function POST(req: Request) {
  const body = await req.json()
  const sb = supa()

  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = user.app_metadata?.tenant_id ?? 1
  const customer = (body.customer_name || 'GENEL')
    .trim()
    .replaceAll('/', '-')
    .replaceAll('\\', '-')

  const parts = [
    'tenants',
    String(tenantId),
    customer,
  ]
  if (body.subfolder) parts.push(String(body.subfolder).trim().replaceAll('/', '-'))
  const key = `${parts.join('/')}/${crypto.randomUUID()}_${body.filename}`

  // REKLAMPRO bucket'ında signed upload URL üret
  const { data, error } = await sb.storage.from('REKLAMPRO').createSignedUploadUrl(key)
  if (error || !data) return NextResponse.json({ error: error?.message || 'upload init failed' }, { status: 400 })

  // Bu örnekte bucket "public" ise public url; "private" ise 'authenticated' endpointi kullan.
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publicUrl = `${base}/storage/v1/object/public/REKLAMPRO/${key}`

  return NextResponse.json({
    upload_url: data.signedUrl,
    key,
    url: publicUrl
  })
}
