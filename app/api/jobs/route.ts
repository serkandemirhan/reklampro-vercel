import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

function isAdmin(role: any) {
  const r = String(role || '').toLowerCase()
  return r === 'admin' || r === 'manager'
}

export async function GET(_req: Request, { params }: { params:{ id:string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error:'unauthorized' }, { status:401 })

  const id = Number(params.id)
  const { data: job, error } = await sb
    .from('job_requests')
    .select('id, job_no, title, description, status, customer_id, created_at')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error:error.message }, { status:400 })

  // müşteri adı
  let customer_name: string | null = null
  if (job.customer_id) {
    const { data: c } = await sb.from('customers').select('name').eq('id', job.customer_id).single()
    customer_name = c?.name ?? null
  }

  return NextResponse.json({ ...job, customer_name })
}

export async function PATCH(req: Request, { params }: { params:{ id:string } }) {
  const body = await req.json()
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error:'unauthorized' }, { status:401 })

  // rol kontrolü
  const role = (user as any).app_metadata?.role
  if (!isAdmin(role)) return NextResponse.json({ error:'forbidden' }, { status:403 })

  const id = Number(params.id)

  // job güncelle
  const patchBody: any = {}
  if (typeof body.title === 'string') patchBody.title = body.title
  if (typeof body.description === 'string') patchBody.description = body.description
  if (typeof body.status === 'string') patchBody.status = body.status

  const { data: updated, error } = await sb
    .from('job_requests')
    .update(patchBody)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error:error.message }, { status:400 })

  // CASCADE: job status → step_instances.status
  if (typeof body.status === 'string') {
    let stepStatus: string | null = null
    if (body.status === 'paused')   stepStatus = 'paused'
    else if (body.status === 'canceled') stepStatus = 'canceled'
    else if (body.status === 'in_progress') stepStatus = null // dokunma
    else if (body.status === 'closed') stepStatus = 'canceled' // kapatınca iptal sayalım

    if (stepStatus) {
      // done olanları bozmadan diğerlerini güncelle
      await sb
        .from('step_instances')
        .update({ status: stepStatus })
        .eq('job_id', id)
        .neq('status', 'done')
    }
  }

  return NextResponse.json(updated)
}
