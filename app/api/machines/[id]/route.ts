import { NextRequest, NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

const allowedStatuses = ['active', 'maintenance', 'inactive'] as const

type MachineStatus = (typeof allowedStatuses)[number]

const normalizeStatus = (status: unknown): MachineStatus | undefined => {
  if (typeof status === 'string' && allowedStatuses.includes(status as MachineStatus)) {
    return status as MachineStatus
  }
  return undefined
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const updates: Record<string, any> = {}
  if (body.name !== undefined) updates.name = String(body.name ?? '').trim()
  if (body.process_id !== undefined) updates.process_id = body.process_id ? Number(body.process_id) : null
  const normalizedStatus = normalizeStatus(body.status)
  if (normalizedStatus) updates.status = normalizedStatus
  if (body.note !== undefined) updates.note = typeof body.note === 'string' ? body.note : null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
  }

  const { data, error } = await sb
    .from('machines')
    .update(updates)
    .eq('id', Number(params.id))
    .select('id, name, process_id, status, note')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({
    id: data.id,
    name: data.name,
    process_id: data.process_id,
    status: normalizeStatus(data.status) ?? 'active',
    note: data.note ?? null,
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await sb.from('machines').delete().eq('id', Number(params.id))
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
