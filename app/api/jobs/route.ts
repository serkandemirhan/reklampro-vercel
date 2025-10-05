
import { NextResponse } from 'next/server'
import { supa } from '../_utils/supabase'

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('job_requests').select('*').order('id', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = user.app_metadata?.tenant_id ?? 1

  const { data: job, error } = await sb.from('job_requests').insert({
    tenant_id: tenantId,
    customer_id: body.customer_id,
    title: body.title,
    description: body.description ?? ''
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Create steps from selected templates
  if (Array.isArray(body.steps)) {
    for (const s of body.steps) {
      const { data: tmpl } = await sb.from('process_templates').select('*').eq('id', s.template_id).single()
      if (!tmpl) continue
      await sb.from('step_instances').insert({
        tenant_id: tenantId,
        job_id: job.id,
        template_id: tmpl.id,
        name: tmpl.name,
        assigned_role: tmpl.default_role,
        assignee_id: s.assignee_id ?? null,
        est_duration_hours: s.est_duration_hours ?? null,
        required_qty: s.required_qty ?? null,
        produced_qty: 0,
        status: 'pending'
      })
    }
  }

  return NextResponse.json(job)
}
