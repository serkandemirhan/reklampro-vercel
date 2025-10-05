
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await sb.from('process_templates').delete().eq('id', Number(params.id))
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
