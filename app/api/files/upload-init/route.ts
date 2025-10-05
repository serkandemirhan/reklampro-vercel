
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function POST(req: Request) {
  const body = await req.json() // { job_id, step_id?, filename }
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = user.app_metadata?.tenant_id ?? 1
  const key = `tenants/${tenantId}/jobs/${body.job_id}/${body.step_id || 'general'}/${crypto.randomUUID()}_${body.filename}`
  const { data, error } = await sb.storage.from('files').createSignedUploadUrl(key)
  if (error || !data) return NextResponse.json({ error: error?.message || 'upload init failed' }, { status: 400 })
  return NextResponse.json({ upload_url: data.signedUrl, key, preview_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${key}` })
}
