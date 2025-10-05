
import { NextResponse } from 'next/server'
import { supa } from '../_utils/supabase'

export async function POST(req: Request) {
  const body = await req.json()
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = user.app_metadata?.tenant_id ?? 1
  const { data, error } = await sb.from('comments').insert({
    tenant_id: tenantId,
    job_id: body.job_id,
    step_id: body.step_id ?? null,
    author_id: user.id,
    body: body.body
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
