
import { NextResponse } from 'next/server'
import { supa } from '../../../_utils/supabase'

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('comments').select('*').eq('job_id', Number(params.jobId)).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
