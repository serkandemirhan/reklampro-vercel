import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() // { name?, default_role?, order_index? }
  const updates: any = {}
  if (typeof body.name === 'string') updates.name = body.name
  if (typeof body.default_role === 'string') updates.default_role = body.default_role
  if (typeof body.order_index === 'number') updates.order_index = body.order_index

  const { data, error } = await sb
    .from('process_templates')
    .update(updates)
    .eq('id', Number(params.id))
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await sb.from('process_templates').delete().eq('id', Number(params.id))
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
