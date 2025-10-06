'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Job = {
  id: number
  job_no: string
  title: string
  description: string | null
  status: 'open' | 'in_progress' | 'paused' | 'closed' | string | null
  customer_id: number | null
  created_at: string
  customer_name?: string | null
}

export default function JobsListPage() {
  const [items, setItems] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Job[] = await res.json()
      setItems(data)
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const renderStatus = (s: Job['status']) => {
    if (s === 'closed')   return <span className="text-red-600 font-medium">Kapatılmış</span>
    if (s === 'paused')   return <span className="text-yellow-600 font-medium">Dondurulmuş</span>
    if (s === 'in_progress') return <span className="text-blue-600 font-medium">Devam Ediyor</span>
    return <span className="text-green-600 font-medium">Yeni</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">İş Talepleri</h2>
        <Link className="btn" href="/jobs/new">Yeni İş Talebi</Link>
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="card p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>No</th>
                <th>Başlık</th>
                <th>Müşteri</th>
                <th>Açıklama</th>
                <th>Durum</th>
                <th>Oluşturulma</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(j => (
                <tr key={j.id} className="border-t">
                  <td className="py-2 font-mono">{j.job_no}</td>
                  <td>{j.title}</td>
                  <td>{j.customer_name ?? '-'}</td>
                  <td className="max-w-xs truncate" title={j.description ?? ''}>
                    {j.description ?? '-'}
                  </td>
                  <td>{renderStatus(j.status)}</td>
                  <td>{new Date(j.created_at).toLocaleString('tr-TR')}</td>
                  <td className="text-right">
                    <Link className="btn" href={`/jobs/${j.id}`}>Detay</Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="py-3 text-gray-500">Kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
