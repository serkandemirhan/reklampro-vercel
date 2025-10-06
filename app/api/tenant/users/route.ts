import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = user.app_metadata?.tenant_id ?? 1

  const { data, error } = await sb
    .from('profiles')            // sende kullanıcıların olduğu tablo
    .select('id, username')      // görünen ad alanı
    .eq('tenant_id', tenantId)
    .order('username', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data || [])
}
