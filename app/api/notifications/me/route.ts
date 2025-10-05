
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function GET() {
  const sb = supa(); const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('notification_preferences').select('*').eq('user_id', user.id).single()
  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) {
    return NextResponse.json({ user_id: user.id, email_on_assign: true, email_on_status: true, email_on_comment: true })
  }
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const sb = supa(); const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('notification_preferences').upsert({
    user_id: user.id,
    email_on_assign: body.email_on_assign ?? true,
    email_on_status: body.email_on_status ?? true,
    email_on_comment: body.email_on_comment ?? true
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
