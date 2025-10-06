import { NextResponse } from 'next/server'
import { supa } from '../../../_utils/supabase'

const STEPS_TABLE = 'step_instances'
const LOGS_TABLE  = 'step_logs'

type Body = {
  assigned_user?: string | null
  action?: 'assign'|'start'|'pause'|'resume'|'complete'|'cancel'
  note?: string
  pause_reason?: string | null
  qty_delta?: number
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = Number(params.id)
  const body = (await req.json()) as Body

  const { data: step, error: gerr } = await sb.from(STEPS_TABLE).select('*').eq('id', id).single()
  if (gerr || !step) return NextResponse.json({ error: gerr?.message || 'Not found' }, { status: 404 })

  const patch: Record<string, any> = {}
  const now = new Date().toISOString()
  if (body.assigned_user !== undefined) patch.assigned_user = body.assigned_user

  const current: string = step.status || 'not_started'
  const allow: Record<string,string[]> = {
    not_started: ['in_progress','canceled'],
    in_progress: ['paused','completed','canceled'],
    paused:      ['in_progress','canceled'],
    completed:   [],
    canceled:    []
  }

  const go = (to: string) => { if (allow[current]?.includes(to)) patch.status = to }

  switch (body.action) {
    case 'start':    go('in_progress'); if (!step.started_at) patch.started_at = now; break
    case 'pause':    go('paused'); patch.pause_reason = body.pause_reason ?? null; break
    case 'resume':   if (current==='paused') patch.status='in_progress', patch.pause_reason=null; break
    case 'complete': go('completed'); patch.completed_at = now; break
    case 'cancel':   go('canceled'); break
  }

  if (typeof body.qty_delta === 'number' && !isNaN(body.qty_delta))
    patch.production_qty = Number(step.production_qty || 0) + Number(body.qty_delta)

  if (body.note !== undefined) patch.note = body.note

  const { error: uerr, data: updated } = await sb.from(STEPS_TABLE).update(patch).eq('id', id).select().single()
  if (uerr) return NextResponse.json({ error: uerr.message }, { status: 400 })

  await sb.from(LOGS_TABLE).insert({
    step_id: id,
    old_status: current,
    new_status: updated.status,
    reason: updated.pause_reason ?? body.pause_reason ?? null,
    qty_delta: body.qty_delta ?? null,
    note: body.note ?? null,
    changed_by: user.id,
  })

  return NextResponse.json(updated)
}
