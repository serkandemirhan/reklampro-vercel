
import { supa } from '../../_utils/supabase'

export async function GET() {
  const sb = supa(); const { data: { user } } = await sb.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const { data, error } = await sb.from('job_requests').select('*')
  if (error) return new Response(error.message, { status: 400 })
  const csv = ['id,title,description,customer_id,created_at']
  for (const j of data || []) csv.push([j.id, JSON.stringify(j.title), JSON.stringify(j.description), j.customer_id, j.created_at].join(','))
  return new Response(csv.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="jobs.csv"' } })
}
