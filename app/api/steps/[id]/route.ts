import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // step
  const { data: step, error } = await sb.from('step_instances')
    .select('*')
    .eq('id', Number(params.id))
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // job (özet)
  const { data: job, error: jobErr } = await sb.from('job_requests')
    .select('id, job_no, title, customer_id')
    .eq('id', step.job_id)
    .single()
  if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 400 })

  // customer (opsiyonel)
  let customer: any = null
  if (job?.customer_id) {
    const { data: c, error: cErr } = await sb.from('customers')
      .select('id, name')
      .eq('id', job.customer_id)
      .single()
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 400 })
    customer = c
  }

  return NextResponse.json({ step, job, customer })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await sb
    .from('step_instances')
    .update(body)
    .eq('id', Number(params.id))
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Opsiyonel audit – Hata oluşursa önemsemiyoruz (await ile al, hata değişkeninde kalsın)
  const { error: _auditErr } = await sb.from('audit_logs').insert({
    tenant_id: user.app_metadata?.tenant_id ?? 1,
    user_id: user.id,
    model: 'step_instances',
    entity_id: data.id,
    action: 'updated',
    field: 'status',
    old_value: null,
    new_value: body.status ?? null
  })
  // _auditErr varsa bile ignore ediyoruz

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = Number(ctx.params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const sb = supa()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await sb.from('step_instances').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 })
  }
}
