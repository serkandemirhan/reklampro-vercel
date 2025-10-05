import { NextRequest, NextResponse } from 'next/server'
import { supa } from '../_utils/supabase'

export async function GET(req: NextRequest) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const status = url.searchParams.get('status') // pending|in_progress|done
  const assignee = url.searchParams.get('assignee_id')
  const q = url.searchParams.get('q')
  const limit = Number(url.searchParams.get('limit') || 200)

  // 1) Steps
  let stepsQuery = sb.from('step_instances')
    .select('id, job_id, template_id, name, status, required_qty, produced_qty, est_duration_hours, assignee_id')
    .order('id', { ascending: false })
    .limit(limit)

  if (status) stepsQuery = stepsQuery.eq('status', status)
  if (assignee) stepsQuery = stepsQuery.eq('assignee_id', assignee)

  const { data: steps, error: e1 } = await stepsQuery
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 })

  if (!steps || steps.length === 0) return NextResponse.json([])

  // 2) Jobs (id setinden)
  const jobIds = [...new Set(steps.map(s => s.job_id))] as number[]
  const { data: jobs, error: e2 } = await sb.from('job_requests')
    .select('id, job_no, title, customer_id, created_at')
    .in('id', jobIds)
  if (e2) return NextResponse.json({ error: e2.message }, { status: 400 })

  // 3) Customers (id setinden)
  const custIds = [...new Set((jobs || []).map(j => j.customer_id).filter(Boolean))] as number[]
  let customers: any[] = []
  if (custIds.length) {
    const { data, error } = await sb.from('customers').select('id, name').in('id', custIds)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    customers = data || []
  }

  const jobMap = new Map(jobs?.map(j => [j.id, j]) || [])
  const custMap = new Map(customers.map(c => [c.id, c]))

  // q metin araması (client tarafı yerine burada da yapalım)
  let joined = steps.map(s => {
    const job = jobMap.get(s.job_id)
    const cust = job ? custMap.get(job.customer_id) : null
    return {
      id: s.id,
      name: s.name,
      status: s.status,
      required_qty: s.required_qty,
      produced_qty: s.produced_qty,
      est_duration_hours: s.est_duration_hours,
      assignee_id: s.assignee_id,
      job_id: s.job_id,
      job_no: job?.job_no || '',
      job_title: job?.title || '',
      customer_name: cust?.name || '',
      created_at: job?.created_at || null
    }
  })

  if (q) {
    const qq = q.toLowerCase()
    joined = joined.filter(r =>
      r.name?.toLowerCase().includes(qq) ||
      r.job_title?.toLowerCase().includes(qq) ||
      r.job_no?.toLowerCase().includes(qq) ||
      r.customer_name?.toLowerCase().includes(qq)
    )
  }

  return NextResponse.json(joined)
}
