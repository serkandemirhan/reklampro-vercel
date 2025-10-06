// app/api/jobs/[id]/steps/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../../../_utils/supabase' // bu path doğru

type UiStep = {
  id: number
  name: string
  status: string
  production_qty: number
  assigned_user: string | null
  note?: string | null
  pause_reason?: string | null
}

const SOURCES = [
  { table: 'step_instances', cols: ['job_request_id','job_id','request_id','parent_job_id'] },
  { table: 'v_all_steps',   cols: ['job_request_id','job_id','request_id'] },
]

function project(row: any): UiStep {
  return {
    id: Number(row.id),
    name: row.name ?? row.step_name ?? row.title ?? row.ad ?? 'Adım',
    status: row.status ?? row.step_status ?? 'not_started',
    production_qty: Number(row.production_qty ?? row.qty ?? 0),
    assigned_user: row.assigned_user ?? row.user_id ?? null,
    note: row.note ?? row.notes ?? null,
    pause_reason: row.pause_reason ?? row.reason ?? null,
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobId = Number(params.id)
  // Kaynakları ve olası kolonları sırasıyla dene; dolu ilk sonucu döndür
  for (const src of SOURCES) {
    for (const col of src.cols) {
      const { data, error } = await sb.from(src.table)
        .select('*')
        .eq(col as any, jobId)
        .order('id', { ascending: true })
        .limit(1000)

      if (!error && data && data.length) {
        return NextResponse.json(data.map(project))
      }
    }
  }

  // hiçbirinde bulunmadıysa boş liste dön
  return NextResponse.json([])
}
