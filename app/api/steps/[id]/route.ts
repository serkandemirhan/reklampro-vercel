
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await sb.from('step_instances').update(body).eq('id', Number(params.id)).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // optional: audit trail example
  await sb.from('audit_logs').insert({
    tenant_id: user.app_metadata?.tenant_id ?? 1,
    user_id: user.id,
    model: 'step_instances',
    entity_id: data.id,
    action: 'updated',
    field: 'status',
    old_value: null,
    new_value: body.status ?? null
  })

  return NextResponse.json(data)
}
