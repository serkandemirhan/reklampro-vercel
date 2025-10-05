
import { NextResponse } from 'next/server'
import { supa } from '../../../_utils/supabase'

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('file_assets').select('*').eq('job_id', Number(params.jobId))
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const tree: Record<string, any[]> = {}
  for (const f of data || []) {
    const parts = (f.key as string).split('/')
    const seg = parts.length >= 2 ? parts[parts.length - 2] : 'general'
    tree[seg] = tree[seg] || []
    tree[seg].push({ id: f.id, name: f.original_name, key: f.key, url: f.url })
  }
  return NextResponse.json(tree)
}
