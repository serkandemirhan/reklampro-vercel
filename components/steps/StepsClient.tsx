// components/steps/StepsClient.tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type Row = {
  step_id: number
  step_name: string
  step_status: string
  step_est_hours: number | null
  step_required: number | null
  job_id: number | null
  job_no: string
  project_title: string
  project_description: string
  customer_name: string
}

export default function StepsClient({ initialRows }: { initialRows: Row[] }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 50

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase()
    return initialRows.filter(r => {
      const okStatus = status === 'all' ? true : (r.step_status || '').toLowerCase() === status
      if (!okStatus) return false
      if (!text) return true
      const hay = [
        r.job_no, r.project_title, r.project_description, r.customer_name,
        r.step_name, r.step_status
      ].join(' ').toLowerCase()
      return hay.includes(text)
    })
  }, [initialRows, q, status])

  const paged = useMemo(() => {
    const end = page * pageSize
    return filtered.slice(0, end)
  }, [filtered, page])

  function exportCSV() {
    const headers = [
      'Talep No','Proje','Müşteri','Açıklama',
      'Adım','Durum','Tah. Saat','Gereksinim','İş ID','Adım ID'
    ]
    const lines = [headers.join(',')]
    filtered.forEach(r => {
      const row = [
        safe(r.job_no),
        safe(r.project_title),
        safe(r.customer_name),
        safe(r.project_description),
        safe(r.step_name),
        safe(r.step_status),
        r.step_est_hours ?? '',
        r.step_required ?? '',
        r.job_id ?? '',
        r.step_id
      ]
      lines.push(row.join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tum-adimlar.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      {/* Kontroller */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="border rounded px-3 py-2 w-72"
          placeholder="Ara: talep no, proje, müşteri, adım..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
        />
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
        >
          <option value="all">Tüm durumlar</option>
          <option value="pending">pending</option>
          <option value="in_progress">in_progress</option>
          <option value="completed">completed</option>
          <option value="frozen">frozen</option>
          <option value="canceled">canceled</option>
        </select>
        <button
          onClick={exportCSV}
          className="ml-auto px-3 py-2 rounded bg-gray-800 text-white"
        >
          CSV Dışa Aktar
        </button>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Talep No</th>
              <th className="py-2 pr-4">Proje</th>
              <th className="py-2 pr-4">Müşteri</th>
              <th className="py-2 pr-4">Açıklama</th>
              <th className="py-2 pr-4">Adım</th>
              <th className="py-2 pr-4">Durum</th>
              <th className="py-2 pr-4">Tah. Saat</th>
              <th className="py-2 pr-4">Gereksinim</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r, i) => (
              <tr key={`${r.step_id}`} className="border-b last:border-0 align-top">
                <td className="py-2 pr-4 whitespace-nowrap">{r.job_no}</td>
                <td className="py-2 pr-4">{r.project_title || '—'}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{r.customer_name || '—'}</td>
                <td className="py-2 pr-4 text-gray-600 max-w-[380px]">
                  {truncate(r.project_description, 160)}
                </td>
                <td className="py-2 pr-4">{r.step_name}</td>
                <td className="py-2 pr-4">{r.step_status}</td>
                <td className="py-2 pr-4">{r.step_est_hours ?? '—'}</td>
                <td className="py-2 pr-4">{r.step_required ?? '—'}</td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  {r.job_id ? (
                    <Link
                      className="px-2 py-1 rounded bg-blue-600 text-white"
                      href={`/jobs/${r.job_id}`}
                    >
                      İşe Git
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-gray-500">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {paged.length < filtered.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Daha fazla yükle
          </button>
        </div>
      )}
    </div>
  )
}

function truncate(s: string, n: number) {
  if (!s) return '—'
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
function safe(s: any) {
  const text = String(s ?? '').replaceAll('"', '""')
  return `"${text}"`
}
