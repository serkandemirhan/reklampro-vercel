
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const job_id = Number(url.searchParams.get('job_id'))
  const step_id = url.searchParams.get('step_id') ? Number(url.searchParams.get('step_id')) : null
  const key = url.searchParams.get('key')!
  const original_name = url.searchParams.get('original_name')!

  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = user.app_metadata?.tenant_id ?? 1

  const preview_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${key}`
  const { data, error } = await sb.from('file_assets').insert({ tenant_id: tenantId, job_id, step_id, key, url: preview_url, original_name }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.id, preview_url })
}
