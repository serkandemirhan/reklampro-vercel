// app/api/files/upload-init/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

// Dosya adını güvenli hale getir (aksan/boşluk vs.)
function toSafeFilename(name: string) {
  const noAccents = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const cleaned = noAccents.replace(/[^a-zA-Z0-9._-]/g, '_')
  return cleaned.replace(/_+/g, '_')
}

/**
 * Beklenen body:
 * {
 *   customer_name?: string,   // örn: "ACME" (boşsa GENEL)
 *   subfolder?: string,       // örn: "teklifler" (opsiyonel)
 *   filename: string          // orijinal dosya adı (zorunlu)
 * }
 */
export async function POST(req: Request) {
  const body = await req.json()
  const sb = supa()

  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = user.app_metadata?.tenant_id ?? 1
  const tenantFolder = `Tenant${tenantId}`

  // 1) Müşteri ve alt klasör adları
  const customer = (body.customer_name ?? 'GENEL')
    .toString().trim()
    .replaceAll('/', '-')
    .replaceAll('\\', '-')

  const subfolder = (body.subfolder ?? '')
    .toString().trim()
    .replaceAll('/', '-')
    .replaceAll('\\', '-')

  // 2) Dosya adı zorunlu
  if (!body.filename) {
    return NextResponse.json({ error: 'filename is required' }, { status: 400 })
  }
  const safeName = toSafeFilename(String(body.filename))

  // 3) Yol parçaları
  const parts = [tenantFolder, customer]
  if (subfolder) parts.push(subfolder)

  const key = `${parts.join('/')}/${crypto.randomUUID()}_${safeName}`

  // 4) Private bucket için signed upload URL
  const { data, error } = await sb.storage.from('REKLAMPRO').createSignedUploadUrl(key)
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'upload init failed' }, { status: 400 })
  }

  return NextResponse.json({ upload_url: data.signedUrl, key })
}
