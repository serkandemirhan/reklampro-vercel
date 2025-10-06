// app/steps/page.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import StepsClient from '@/components/steps/StepsClient'

export const dynamic = 'force-dynamic'

export default async function AllStepsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Oturum (gerekirse role kontrol ekleyebilirsin)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="p-6">
        Oturum bulunamadı. Lütfen giriş yapın.
      </div>
    )
  }

  // 1) Son 200 adımı çek (gerekirse artırılabilir; client’ta “Load more” var)
  const { data: steps, error: eSteps } = await supabase
    .from('step_instances')
    .select('id, job_id, name, status, est_duration_hours, required_qty')
    .order('id', { ascending: false })
    .limit(200)

  if (eSteps) {
    return <div className="p-6 text-red-600">Adımlar yüklenemedi: {eSteps.message}</div>
  }

  const jobIds = Array.from(new Set((steps ?? []).map(s => s.job_id))).filter(Boolean)
  let jobs: any[] = []
  if (jobIds.length > 0) {
    const { data: jobsData } = await supabase
      .from('job_requests')
      .select('id, job_no, title, description, customer_id')
      .in('id', jobIds)
    jobs = jobsData ?? []
  }

  const customerIds = Array.from(new Set(jobs.map(j => j.customer_id).filter(Boolean)))
  let customers: any[] = []
  if (customerIds.length > 0) {
    const { data: custData } = await supabase
      .from('customers')
      .select('id, name')
      .in('id', customerIds)
    customers = custData ?? []
  }

  // Join’lanmış satırları hazırla
  const rows = (steps ?? []).map(s => {
    const job = jobs.find(j => j.id === s.job_id)
    const cust = job ? customers.find(c => c.id === job.customer_id) : null
    return {
      step_id: s.id,
      step_name: s.name,
      step_status: s.status ?? 'pending',
      step_est_hours: s.est_duration_hours ?? null,
      step_required: s.required_qty ?? null,

      job_id: job?.id ?? null,
      job_no: job?.job_no ?? (job?.id ? `JOB-${job.id}` : ''),
      project_title: job?.title ?? '',
      project_description: job?.description ?? '',
      customer_name: cust?.name ?? (job?.customer_id ?? '—'),
    }
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tüm Adımlar</h1>
        <div className="text-sm text-gray-500">{rows.length} kayıt</div>
      </div>
      <StepsClient initialRows={rows} />
    </div>
  )
}
