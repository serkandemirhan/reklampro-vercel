// app/api/tenant/users/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = user.app_metadata?.tenant_id ?? 1

  try {
    const { data, error } = await sb.rpc('fn_list_tenant_users', { p_tenant_id: tenantId })
    if (error) throw error
    if (Array.isArray(data) && data.length) {
      return NextResponse.json(
        data.map((u: any) => ({ id: u.id, username: u.username ?? u.email ?? String(u.id).slice(0,8) }))
      )
    }
  } catch (_) {
    // fallback: en azından kendi kullanıcını dön
  }

  return NextResponse.json([{ id: user.id, username: user.email ?? 'Kullanıcı' }])
}
