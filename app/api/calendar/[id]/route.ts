
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const sb = supa(); const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('calendar_events').update({
    job_id: body.job_id, step_id: body.step_id ?? null, title: body.title, start_at: body.start, end_at: body.end, location: body.location ?? ''
  }).eq('id', Number(params.id)).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const sb = supa(); const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await sb.from('calendar_events').delete().eq('id', Number(params.id))
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
