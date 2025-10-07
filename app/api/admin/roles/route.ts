import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

type ProcessRow = {
  id: number
  name: string
  is_parallel: boolean
  is_machine_based: boolean
  is_production: boolean
}

type RoleRow = {
  id: number
  name: string
}

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [processRes, roleRes] = await Promise.all([
    sb
      .from('process_templates')
      .select('id, name, is_parallel, is_machine_based, is_production')
      .order('order_index', { ascending: true }),
    sb.from('workflow_roles').select('id, name').order('name', { ascending: true }),
  ])

  if (processRes.error) return NextResponse.json({ error: processRes.error.message }, { status: 400 })
  if (roleRes.error) return NextResponse.json({ error: roleRes.error.message }, { status: 400 })

  const processes: ProcessRow[] = (processRes.data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    is_parallel: !!row.is_parallel,
    is_machine_based: !!row.is_machine_based,
    is_production: !!row.is_production,
  }))

  const roles: RoleRow[] = (roleRes.data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
  }))

  return NextResponse.json({ processes, roles })
}
