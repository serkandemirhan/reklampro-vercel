
import { supa } from '../../_utils/supabase'

export async function GET() {
  const sb = supa(); const { data: { user } } = await sb.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const { data, error } = await sb.from('step_instances').select('*')
  if (error) return new Response(error.message, { status: 400 })
  const csv = ['id,job_id,name,status,est_duration_hours,required_qty,produced_qty,assignee_id']
  for (const s of data || []) csv.push([s.id,s.job_id,JSON.stringify(s.name),s.status,s.est_duration_hours??'',s.required_qty??'',s.produced_qty??'',s.assignee_id??''].join(','))
  return new Response(csv.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="steps.csv"' } })
}
