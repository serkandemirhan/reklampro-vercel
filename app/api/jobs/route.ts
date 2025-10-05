import { NextResponse } from 'next/server'
import { supa } from '../_utils/supabase'

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error } = await sb
    .from('job_requests')
    .select('id, job_no, title, description, customer_id, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const tenantId = (user.app_metadata as any)?.tenant_id ?? 1

  // 1) İş talebi
  const { data: created, error: e1 } = await sb
    .from('job_requests')
    .insert({
      tenant_id: tenantId,
      customer_id: body.customer_id ?? null,
      title: body.title,
      description: body.description ?? '',
      created_by: user.id
    })
    .select('id, job_no')
    .single()

  if (e1) return NextResponse.json({ error: `job_insert: ${e1.message}` }, { status: 400 })

  // 2) Seçilen süreçlerden görevleri üret
  if (Array.isArray(body.steps) && body.steps.length > 0) {
    // İsteğe bağlı: şablon adını kopyalayalım
    const ids = body.steps.map((s: any) => s.template_id).filter(Boolean)
    let nameMap = new Map<number, string>()
    if (ids.length) {
      const { data: temps, error } = await sb.from('process_templates')
        .select('id, name')
        .in('id', ids)
      if (!error && temps) nameMap = new Map(temps.map(t => [t.id as number, t.name as string]))
    }

    const stepsPayload = body.steps.map((s: any) => ({
      tenant_id: tenantId,
      job_id: created.id,
      template_id: s.template_id,
      name: nameMap.get(s.template_id) || null,
      est_duration_hours: s.est_duration_hours ?? null,
      required_qty: s.required_qty ?? null,
      produced_qty: 0,
      status: 'pending',
      assignee_id: s.assignee_id ?? null
    }))

    const { error: e2 } = await sb.from('step_instances').insert(stepsPayload)
    if (e2) return NextResponse.json({ error: `steps_insert: ${e2.message}` }, { status: 400 })
  }

  return NextResponse.json(created)
}
