// app/api/files/upload-init/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function POST(req: Request) {
  const body = await req.json()
  const sb = supa()

  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = user.app_metadata?.tenant_id ?? 1
  const tenantFolder = `Tenant${tenantId}`

  // 1) ÖNCE müşteri ve alt klasör adlarını hazırla
  const customer = (body.customer_name ?? 'GENEL')
    .toString()
    .trim()
    .replaceAll('/', '-')
    .replaceAll('\\', '-')

  const subfolder = (body.subfolder ?? '')
    .toString()
    .trim()
    .replaceAll('/', '-')
    .replaceAll('\\', '-')

  // 2) Sonra path parçalarını oluştur
  const parts = [tenantFolder, customer]
  if (subfolder) parts.push(subfolder)

  // 3) Dosya adı zorunlu
  if (!body.filename) {
    return NextResponse.json({ error: 'filename is required' }, { status: 400 })
  }

  const key = `${parts.join('/')}/${crypto.randomUUID()}_${body.filename}`

  // 4) Private bucket için signed upload URL
  const { data, error } = await sb.storage.from('REKLAMPRO').createSignedUploadUrl(key)
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'upload init failed' }, { status: 400 })
  }

  return NextResponse.json({ upload_url: data.signedUrl, key })
}
