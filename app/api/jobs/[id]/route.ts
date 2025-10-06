// app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'  // ✅ DOĞRU: iki seviyeye çık

// GET /api/jobs/:id  -> detay (adımlarla birlikte)
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const sb = supa()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: job, error: e1 } = await sb
      .from('job_requests')
      .select('id, job_no, title, description, status, customer_id, created_at')
      .eq('id', id)
      .single()

    if (e1) return NextResponse.json({ error: e1.message }, { status: 404 })

    const { data: steps, error: e2 } = await sb
      .from('step_instances')
      .select('id, name, status, est_duration_hours, required_qty, created_at')
      .eq('job_id', id)
      .order('id', { ascending: true })

    if (e2) return NextResponse.json({ error: e2.message }, { status: 400 })

    return NextResponse.json({ ...job, steps: steps ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}

// PATCH /api/jobs/:id  -> güncelleme (freeze/cancel dahil)
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const sb = supa()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const updatePayload: any = {}
    ;['title', 'description', 'status', 'customer_id'].forEach((k) => {
      if (body[k] !== undefined) updatePayload[k] = body[k]
    })

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: job, error: e1 } = await sb
      .from('job_requests')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (e1) return NextResponse.json({ error: e1.message }, { status: 400 })

    // İş donduruldu/iptal edildi -> alt adımlar da aynı statü
    if (body.status === 'frozen' || body.status === 'canceled') {
      const { error: e2 } = await sb
        .from('step_instances')
        .update({ status: body.status })
        .eq('job_id', id)

      if (e2) return NextResponse.json({ error: e2.message }, { status: 400 })
    }

    return NextResponse.json(job)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}
