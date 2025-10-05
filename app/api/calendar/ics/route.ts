
import { NextResponse } from 'next/server'
import { supa } from '../../_utils/supabase'

export async function GET() {
  const sb = supa(); const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('calendar_events').select('title, start_at, end_at, location')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0']
  for (const e of data || []) {
    lines.push('BEGIN:VEVENT')
    lines.push(`SUMMARY:${e.title}`)
    lines.push(`DTSTART:${new Date(e.start_at).toISOString().replace(/[-:]/g,'').split('.')[0]}Z`)
    lines.push(`DTEND:${new Date(e.end_at).toISOString().replace(/[-:]/g,'').split('.')[0]}Z`)
    if (e.location) lines.push(`LOCATION:${e.location}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return new Response(lines.join('\r\n'), { headers: { 'Content-Type': 'text/calendar', 'Content-Disposition': 'attachment; filename="calendar.ics"' } })
}
