// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supa } from '../_utils/supabase'   // ✅ düzeltildi

export async function GET(req: NextRequest) {
  try {
    const sb = supa()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') || 100)

    const { data, error } = await sb
      .from('job_requests')
      .select('id, job_no, title, description, status, customer_id, created_at')
      .order('id', { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sb = supa()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tenantId =
      // @ts-ignore
      user?.app_metadata?.tenant_id ?? body?.tenant_id ?? 1

    const jobPayload: any = {
      tenant_id: tenantId,
      customer_id: body.customer_id ?? null,
      title: String(body.title || body.customer_name || 'İş Talebi'),
      description: String(body.description || ''),
      status: body.status ?? 'in_progress',
    }

    const { data: job, error: e1 } = await sb
      .from('job_requests')
      .insert(jobPayload)
      .select('*')
      .single()

    if (e1) return NextResponse.json({ error: e1.message }, { status: 400 })

    const steps = Array.isArray(body.steps) ? body.steps : []
    if (steps.length > 0) {
      const rows = steps.map((s: any) => ({
        tenant_id: tenantId,
        job_id: job.id,
        template_id: s.template_id ?? null,
        name: String(s.name || s.title || 'Adım'),
        est_duration_hours: s.est_duration_hours ?? s.estimated_hours ?? null,
        required_qty: s.required_qty ?? s.required ?? null,
        status: 'pending',
      }))
      const { error: e2 } = await sb.from('step_instances').insert(rows)
      if (e2) return NextResponse.json({ error: e2.message }, { status: 400 })
    }

    const job_no = job.job_no ??
