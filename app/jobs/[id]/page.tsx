// app/jobs/[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type PageProps = { params: { id: string } }

export default async function JobDetailPage({ params }: PageProps) {
  const jobId = Number(params.id)
  if (Number.isNaN(jobId)) {
    return <div className="p-6">Geçersiz iş ID: {params.id}</div>
  }

  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr) {
    return <div className="p-6">Oturum kontrol hatası: {userErr.message}</div>
  }
  if (!user) {
    return (
      <div className="p-6">
        Oturum bulunamadı.{' '}
        <Link className="text-blue-600 underline" href="/login">
          Giriş yapın
        </Link>
        .
      </div>
    )
  }

  // İş kaydı
  const { data: job, error: e1 } = await supabase
    .from('job_requests')
    .select('id, job_no, title, description, status, customer_id, created_at')
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

  // Alt adımlar
  const { data: steps, error: e2 } = await supabase
    .from('step_instances')
    .select('id, name, status, est_duration_hours, required_qty, created_at')
    .eq('job_id', jobId)
  // .order('id', { ascending: true }) // kolon yoksa sorun olmasın diye yoruma aldım

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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Başlık</div>
          <div className="font-medium">{job.title}</div>
        </div>
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Durum</div>
          <div className="font-medium">{job.status ?? 'bilinmiyor'}</div>
        </div>
        <div className="p-4 rounded-xl border md:col-span-2">
          <div className="text-sm text-gray-500 mb-1">Açıklama</div>
          <div className="whitespace-pre-wrap">{job.description || '—'}</div>
        </div>
      </div>

      <div className="p-4 rounded-xl border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Adımlar</h2>
          <div className="text-sm text-gray-500">
            {steps?.length ?? 0} kayıt
          </div>
        </div>

        {e2 && (
          <div className="text-red-600 text-sm mb-2">
            Adımlar yüklenemedi: {e2.message}
          </div>
        )}

        {(!steps || steps.length === 0) ? (
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
