
import { NextResponse } from 'next/server'
import { supa } from '../_utils/supabase'

export async function GET() {
  const sb = supa(); const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('calendar_events').select('id, job_id, step_id, title, start_at, end_at, location')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json((data || []).map((e:any)=>({ id:e.id, job_id:e.job_id, step_id:e.step_id, title:e.title, start:e.start_at, end:e.end_at, location:e.location })))
}

export async function POST(req: Request) {
  const body = await req.json()
  const sb = supa(); const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = user.app_metadata?.tenant_id ?? 1
  const { data, error } = await sb.from('calendar_events').insert({
    tenant_id: tenantId, job_id: body.job_id, step_id: body.step_id ?? null,
    title: body.title, start_at: body.start, end_at: body.end, location: body.location ?? ''
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json((data || []).map((e:any)=>({ id:e.id, job_id:e.job_id, step_id:e.step_id, title:e.title, start:e.start_at, end:e.end_at, location:e.location })))
}
