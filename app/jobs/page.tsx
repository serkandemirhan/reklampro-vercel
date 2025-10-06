// app/jobs/page.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import JobsListClient from '@/components/jobs/JobsListClient'

export const dynamic = 'force-dynamic'  // her istekte taze veri
export const revalidate = 0

export default async function JobsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="p-6">Lütfen giriş yapın.</div>
  }

  // İşleri çek (durum dahil)
  const { data: jobs, error } = await supabase
    .from('job_requests')
    .select('id, job_no, title, description, status, customer_id, created_at')
    .order('id', { ascending: false })
    .limit(300)

  if (error) {
    return <div className="p-6 text-red-600">İşler yüklenemedi: {error.message}</div>
  }

  // Müşteri adları için lookup
  const customerIds = Array.from(new Set((jobs ?? []).map(j => j.customer_id).filter(Boolean)))
  let customers: { id: number; name: string }[] = []
  if (customerIds.length > 0) {
    const { data } = await supabase
      .from('customers')
      .select('id, name')
      .in('id', customerIds as number[])
    customers = data ?? []
  }

  const rows = (jobs ?? []).map(j => ({
    id: j.id,
    job_no: j.job_no ?? `JOB-${j.id}`,
    title: j.title ?? '',
    description: j.description ?? '',
    status: j.status ?? 'open',
    customer_name: customers.find(c => c.id === j.customer_id)?.name ?? '—',
    created_at: j.created_at, // ISO string
  }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">İş Talepleri</h1>
      <JobsListClient rows={rows} />
    </div>
  )
}
