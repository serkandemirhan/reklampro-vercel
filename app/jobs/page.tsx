'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Job = {
  id: number
  job_no: string
  title: string
  description: string | null
  status: 'open' | 'in_progress' | 'paused' | 'closed' | 'canceled' | string | null
  customer_id: number | null
  created_at: string
  customer_name?: string | null
}

type SortKey = 'job_no' | 'title' | 'customer_name' | 'created_at' | 'status'

export default function JobsListPage() {
  const [items, setItems] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const router = useRouter()

  useEffect(() => {
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
    load()
  }, [])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let rows = !needle ? items : items.filter(j => {
      return [
        j.job_no,
        j.title,
        j.customer_name ?? '',
        j.description ?? ''
      ].some(v => (v ?? '').toString().toLowerCase().includes(needle))
    })
    rows = rows.slice().sort((a, b) => {
      const va = (a as any)[sortKey] ?? ''
      const vb = (b as any)[sortKey] ?? ''
      if (sortKey === 'created_at') {
        const da = new Date(a.created_at).getTime()
        const db = new Date(b.created_at).getTime()
        return sortDir === 'asc' ? da - db : db - da
      }
      const ca = String(va).localeCompare(String(vb), 'tr')
      return sortDir === 'asc' ? ca : -ca
    })
    return rows
  }, [items, q, sortKey, sortDir])

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const renderStatus = (s: Job['status']) => {
    if (s === 'canceled')   return <span className="text-red-600 font-medium">İptal</span>
    if (s === 'closed')     return <span className="text-red-600 font-medium">Kapatılmış</span>
    if (s === 'paused')     return <span className="text-yellow-600 font-medium">Dondurulmuş</span>
    if (s === 'in_progress')return <span className="text-blue-600 font-medium">Devam Ediyor</span>
    return <span className="text-green-600 font-medium">Yeni</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">İş Talepleri</h2>
        <div className="flex items-center gap-2">
          <input
            className="input w-72"
            placeholder="Ara: no / başlık / müşteri / açıklama"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <Link className="btn" href="/jobs/new">Yeni İş Talebi</Link>
        </div>
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="card p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="cursor-pointer" onClick={() => onSort('job_no')}>No</th>
                <th className="cursor-pointer" onClick={() => onSort('title')}>Başlık</th>
                <th className="cursor-pointer" onClick={() => onSort('customer_name')}>Müşteri</th>
                <th>Açıklama</th>
                <th className="cursor-pointer" onClick={() => onSort('status')}>Durum</th>
                <th className="cursor-pointer" onClick={() => onSort('created_at')}>Oluşturulma</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => (
                // SATIR TIKLANABİLİR
                <tr
                  key={j.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/jobs/${j.id}`)}
                >
                  <td className="py-2 font-mono">{j.job_no}</td>
                  <td>{j.title}</td>
                  <td>{j.customer_name ?? '-'}</td>
                  <td className="max-w-xs truncate" title={j.description ?? ''}>
                    {j.description ?? '-'}
                  </td>
                  <td>{renderStatus(j.status)}</td>
                  <td>{new Date(j.created_at).toLocaleString('tr-TR')}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-3 text-gray-500">Kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
