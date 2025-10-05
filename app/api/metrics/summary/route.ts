
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [jobs, steps, pending, inprog, done] = await Promise.all([
    sb.from('job_requests').select('id', { count: 'exact', head: true }),
    sb.from('step_instances').select('id', { count: 'exact', head: true }),
    sb.from('step_instances').select('id', { count: 'exact', head: true }).eq('status','pending'),
    sb.from('step_instances').select('id', { count: 'exact', head: true }).eq('status','in_progress'),
    sb.from('step_instances').select('id', { count: 'exact', head: true }).eq('status','done'),
  ])

  return NextResponse.json({
    jobs: jobs.count || 0,
    steps_total: steps.count || 0,
    steps_pending: pending.count || 0,
    steps_in_progress: inprog.count || 0,
    steps_done: done.count || 0
  })
}
