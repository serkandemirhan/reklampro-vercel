// app/api/jobs/route.ts
import { NextResponse } from 'next/server'
import { supa } from '../_utils/supabase'

type JobRow = {
  id: number
  job_no: string
  title: string
  description: string | null
  status: string | null
  customer_id: number | null
  created_at: string
}

export async function GET() {
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // 1) İş taleplerini al
  const { data: jobs, error } = await sb
    .from('job_requests')
    .select('id, job_no, title, description, status, customer_id, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // 2) Müşteri adlarını tek IN sorgusu ile getir
  const customerIds = Array.from(
    new Set((jobs || []).map(j => j.customer_id).filter(Boolean) as number[])
  )

  let namesById: Record<number, string> = {}
  if (customerIds.length > 0) {
    const { data: customers, error: cErr } = await sb
      .from('customers')
      .select('id, name')
      .in('id', customerIds)

    if (cErr) {
      // müşteri tablosu erişilemezse isimleri boş ver
      namesById = {}
    } else {
      namesById = Object.fromEntries((customers || []).map(c => [c.id, c.name]))
    }
  }

  const payload = (jobs || []).map(j => ({
    ...j,
    customer_name: j.customer_id ? namesById[j.customer_id] ?? null : null,
  }))

  return NextResponse.json(payload)
}

/**
 * İsteğe bağlı: Sizde POST zaten varsa bırakın.
 * Aşağıdaki iskelet, yeni iş talebi oluşturmak içindir.
 */
export async function POST(req: Request) {
  const body = await req.json()
  const sb = supa()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Örnek alanlar: title, description, customer_id, status
  const { title, description, customer_id, status } = body

  const job_no = body.job_no ?? `T${new Date().toISOString().slice(0,10).replace(/-/g,'')}${Math.floor(Math.random()*1e6).toString().padStart(6,'0')}`

  const { data: created, error } = await sb
    .from('job_requests')
    .insert({
      job_no,
      title,
      description: description ?? null,
      customer_id: customer_id ?? null,
      status: status ?? 'open',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(created, { status: 201 })
}
