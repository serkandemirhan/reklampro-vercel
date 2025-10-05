
import { NextResponse } from 'next/server'
import { supa } from '../../../_utils/supabase'

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('file_assets').select('id,key,original_name,url').eq('job_id', Number(params.jobId))
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data.map((x:any)=>({ id:x.id, key:x.key, name:x.original_name, url:x.url })))
}
