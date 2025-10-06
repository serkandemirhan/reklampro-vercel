import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await sb
    .from('customers')
    .select('id, name')
    .eq('id', Number(params.id))
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
