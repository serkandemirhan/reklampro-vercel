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
  const body = await req.json()
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const tenantId = (user.app_metadata as any)?.tenant_id ?? 1
  // job_no’yu asla client’tan almayız (trigger set eder)
  const insertPayload: any = {
    tenant_id: tenantId,
    customer_id: body.customer_id ?? null,
    title: body.title,
    description: body.description ?? '',
    created_by: user.id
  }

  const { data: created, error } = await sb
    .from('job_requests')
    .insert(insertPayload)
    .select('id, job_no, title, customer_id, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // İsteğe bağlı: seçilen süreçlerden adım oluşturma (varsa body.steps)
  if (Array.isArray(body.steps) && body.steps.length > 0) {
    const stepsPayload = body.steps.map((s: any) => ({
      tenant_id: tenantId,
      job_id: created.id,
      template_id: s.template_id,
      est_duration_hours: s.est_duration_hours ?? null,
      required_qty: s.required_qty ?? null,
      status: 'pending'
    }))
    await sb.from('step_instances').insert(stepsPayload)
  }

  return NextResponse.json(created)
}
