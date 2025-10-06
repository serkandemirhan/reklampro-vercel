// app/jobs/[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import JobDetailClient from '@/components/jobs/JobDetailClient'

export const dynamic = 'force-dynamic'

type PageProps = { params: { id: string } }

export default async function JobDetailPage({ params }: PageProps) {
  const jobId = Number(params.id)
  if (Number.isNaN(jobId)) {
    return <div className="p-6">Geçersiz iş ID: {params.id}</div>
  }

  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const role = (user as any)?.app_metadata?.role
  const isAdmin = role === 'admin' || role === 'manager' || role === 'superadmin' || true // demo
  const isSuperadmin = role === 'superadmin'

  // İş
  const { data: job, error: e1 } = await supabase
    .from('job_requests')
    .select('id, job_no, title, description, status, customer_id, tenant_id, created_at')
    .eq('id', jobId)
    .single()
  if (e1 || !job) {
    return (
      <div className="p-6">
        İş bulunamadı. {e1?.message && <span>({e1.message})</span>}
        <div className="mt-4">
          <Link href="/jobs" className="text-blue-600 underline">İş listesine dön</Link>
        </div>
      </div>
    )
  }

  // Adımlar
  const { data: steps } = await supabase
    .from('step_instances')
    .select('id, job_id, name, status, est_duration_hours, required_qty, template_id')
    .eq('job_id', jobId)
    .order('id', { ascending: true })

  // Müşteri listesi (isim göstermek ve değiştirmek için)
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name')
    .order('name', { ascending: true })

  const jobNo = job.job_no ?? `JOB-${job.id}`
  const customerName =
    customers?.find((c) => c.id === job.customer_id)?.name ?? (job.customer_id ?? '—')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">İş Detayı</h1>
          <p className="text-sm text-gray-500">#{jobNo}</p>
        </div>
        <Link href="/jobs" className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">← Listeye Dön</Link>
      </div>

      <JobDetailClient
        id={job.id}
        initialTitle={job.title}
        initialDescription={job.description}
        initialStatus={job.status ?? 'open'}
        initialCustomerId={job.customer_id ?? null}
        initialCustomerName={customerName}
        customers={customers ?? []}
        isAdmin={isAdmin}
        isSuperadmin={isSuperadmin}
        tenantId={job.tenant_id ?? null}
        createdAt={job.created_at ?? null}
        steps={steps ?? []}
      />
    </div>
  )
}
