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

  // Basit rol saptama (app_metadata.role yoksa yönetici sayalım diyorsan true bırak)
  const isAdmin =
    // @ts-ignore
    (user?.app_metadata?.role === 'admin' || user?.app_metadata?.role === 'superadmin' || true)

  // İş kaydı (oluştururken girilen temel alanlar)
  const { data: job, error: e1 } = await supabase
    .from('job_requests')
    .select('id, job_no, title, description, status, customer_id, created_at, tenant_id')
    .eq('id', jobId)
    .single()

  if (e1 || !job) {
    return (
      <div className="p-6">
        İş bulunamadı veya erişim yok. {e1?.message && <span>({e1.message})</span>}
        <div className="mt-4">
          <Link href="/jobs" className="text-blue-600 underline">
            İş listesine dön
          </Link>
        </div>
      </div>
    )
  }

  // Adımlar (oluştururken seçilen süreçler)
  const { data: steps, error: e2 } = await supabase
    .from('step_instances')
    .select('id, name, status, est_duration_hours, required_qty')
    .eq('job_id', jobId)
    .order('id', { ascending: true })

  const jobNo = job.job_no ?? `JOB-${job.id}`

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">İş Detayı</h1>
          <p className="text-sm text-gray-500">#{jobNo}</p>
        </div>
        <Link href="/jobs" className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">
          ← Listeye Dön
        </Link>
      </div>

      {/* Düzenlenebilir özet kartları */}
      <JobDetailClient
        id={job.id}
        initialTitle={job.title}
        initialDescription={job.description}
        initialStatus={job.status ?? 'open'}
        isAdmin={isAdmin}
      />

      {/* Oluştururken girilen diğer alanlar (salt okunur bilgi kartları) */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Müşteri ID</div>
          <div className="font-medium">{job.customer_id ?? '—'}</div>
        </div>
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Tenant</div>
          <div className="font-medium">{job.tenant_id ?? '—'}</div>
        </div>
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Oluşturma</div>
          <div className="font-medium">
            {job.created_at ? new Date(job.created_at).toLocaleString() : '—'}
          </div>
        </div>
      </div>

      {/* Adımlar tablosu */}
      <div className="p-4 rounded-xl border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Adımlar</h2>
          <div className="text-sm text-gray-500">{steps?.length ?? 0} kayıt</div>
        </div>

        {e2 && (
          <div className="text-red-600 text-sm mb-2">
            Adımlar yüklenemedi: {e2.message}
          </div>
        )}

        {!steps || steps.length === 0 ? (
          <div className="text-sm text-gray-500">Bu iş için henüz adım yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Ad</th>
                  <th className="py-2 pr-4">Durum</th>
                  <th className="py-2 pr-4">Tah. Süre (saat)</th>
                  <th className="py-2 pr-4">Gereksinim</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s, idx) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{idx + 1}</td>
                    <td className="py-2 pr-4">{s.name}</td>
                    <td className="py-2 pr-4">{s.status ?? '—'}</td>
                    <td className="py-2 pr-4">{s.est_duration_hours ?? '—'}</td>
                    <td className="py-2 pr-4">{s.required_qty ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
