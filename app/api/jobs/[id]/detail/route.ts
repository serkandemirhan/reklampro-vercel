// src/app/api/jobs/[id]/detail/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../../../_utils/supabase'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sb = supa()
  const jobId = Number(params.id)

  // job_requests'tan tek kayıt
  const { data: job, error } = await sb
    .from('job_requests')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error || !job) {
    return NextResponse.json({ error: error?.message || 'Job not found' }, { status: 404 })
  }

  // alan adlarını esnek şekilde topla (şeman farklı olsa bile çalışsın)
  const jobInfo = {
    id: job.id,
    title: job.title ?? job.name ?? job.subject ?? '',
    description: job.description ?? job.desc ?? '',
    status: job.status ?? job.state ?? job.phase ?? '',
    customer_id: job.customer_id ?? job.customer ?? null,
    created_at: job.created_at ?? job.inserted_at ?? job.created ?? null,
  }

  // müşteri adı (varsa)
  let customer_name: string | null = null
  if (jobInfo.customer_id) {
    const { data: cust } = await sb
      .from('customers')
      .select('name, title, company, display_name')
      .eq('id', jobInfo.customer_id)
      .single()
    if (cust) {
      customer_name =
        cust.name ?? cust.title ?? cust.company ?? cust.display_name ?? null
    }
  }

  return NextResponse.json({ ...jobInfo, customer_name })
}
