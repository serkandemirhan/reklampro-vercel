'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Job = {
  id: number
  job_no: string
  title: string
  description: string | null
  status: 'open' | 'in_progress' | 'paused' | 'closed' | string
  customer_id: number | null
  created_at: string
  customer_name?: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const loadJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs') // mevcut api route'un
      const data = await res.json()

      // müşteri isimlerini getir
      const jobsWithNames = await Promise.all(
        data.map(async (j: Job) => {
          if (j.customer_id) {
            const resCust = await fetch(`/api/customers/${j.customer_id}`)
            if (resCust.ok) {
              const cust = await resCust.json()
              j.customer_name = cust.name
            }
          }
          return j
        })
      )

      setJobs(jobsWithNames)
    } catch (err) {
      console.error('Jobs yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadJobs() }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">İş Talepleri</h2>
        <Link href="/jobs/create" className="btn">Yeni İş Talebi</Link>
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>No</th>
                <th>Başlık</th>
                <th>Müşteri</th>
                <th>Açıklama</th>
                <th>Durum</th>
                <th>Oluşturulma</th>
                <th className="text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-t">
                  <td>{job.job_no}</td>
                  <td>{job.title}</td>
                  <td>{job.customer_name ?? '-'}</td>
                  <td className="max-w-xs truncate" title={job.description ?? ''}>
                    {job.description ?? '-'}
                  </td>
                  <td>
                    {job.status === 'closed' && <span className="text-red-600 font-medium">Kapatılmış</span>}
                    {job.status === 'paused' && <span className="text-yellow-600 font-medium">Dondurulmuş</span>}
                    {job.status === 'in_progress' && <span className="text-blue-600 font-medium">Devam Ediyor</span>}
                    {job.status === 'open' && <span className="text-green-600 font-medium">Yeni</span>}
                  </td>
                  <td>{new Date(job.created_at).toLocaleString('tr-TR')}</td>
                  <td className="text-right">
                    <Link href={`/jobs/${job.id}`} className="btn">Detay</Link>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr><td colSpan={7} className="py-3 text-gray-500">Henüz iş talebi yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
