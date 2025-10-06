// app/api/jobs/[id]/steps/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../../../_utils/supabase' // yol doğru: api/jobs/[id]/steps → ../.. /_utils

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = supa()

  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobId = Number(params.id)

  // ! DİKKAT: sende bağlayan kolon "job_request_id" değilse burada değiştir
  const { data, error } = await sb
    .from('step_instances')
    .select('id,name,status,production_qty,assigned_user,note,pause_reason')
    .eq('job_request_id', jobId)   // ör: .eq('job_id', jobId)
    .order('id', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data ?? [])
}
