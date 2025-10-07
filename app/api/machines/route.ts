import { NextResponse } from 'next/server'
import { supa } from '../_utils/supabase'

type MachineRow = {
  id: number
  name: string
  process_id: number | null
  status: 'active' | 'maintenance' | 'inactive'
  note: string | null
}

const allowedStatuses = ['active', 'maintenance', 'inactive'] as const

type MachineStatus = (typeof allowedStatuses)[number]

const normalizeStatus = (status: unknown): MachineStatus => {
  if (typeof status === 'string' && allowedStatuses.includes(status as MachineStatus)) {
    return status as MachineStatus
  }
  return 'active'
}

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await sb
    .from('machines')
    .select('id, name, process_id, status, note')
    .order('id', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const rows: MachineRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    process_id: row.process_id,
    status: normalizeStatus(row.status),
    note: row.note ?? null,
  }))

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = user.app_metadata?.tenant_id ?? 1
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'Makine adı gerekli' }, { status: 400 })

  const payload = {
    tenant_id: tenantId,
    name,
    process_id: body.process_id ? Number(body.process_id) : null,
    status: normalizeStatus(body.status),
    note: typeof body.note === 'string' ? body.note : null,
  }

  const { data, error } = await sb.from('machines').insert(payload).select('id, name, process_id, status, note').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({
    id: data.id,
    name: data.name,
    process_id: data.process_id,
    status: normalizeStatus(data.status),
    note: data.note ?? null,
  })
}
