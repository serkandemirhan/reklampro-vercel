// components/jobs/JobsListClient.tsx
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Row = {
  id: number
  job_no: string
  title: string
  description: string
  status: string
  customer_name: string
  created_at: string | null
}

export default function JobsListClient({ rows }: { rows: Row[] }) {
  // relative time’ın canlı güncellenmesi için her 60 sn “tik”
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60_000)
    return () => clearInterval(t)
  }, [])

  const items = useMemo(() => rows, [rows])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">No</th>
            <th className="py-2 pr-4">Başlık</th>
            <th className="py-2 pr-4">Müşteri</th>
            <th className="py-2 pr-4">Açıklama</th>
            <th className="py-2 pr-4">Durum</th>
            <th className="py-2 pr-4">Oluşturulma</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-b last:border-0 align-top">
              <td className="py-2 pr-4 whitespace-nowrap">
                <Link href={`/jobs/${r.id}`} className="text-blue-600 hover:underline">
                  {r.job_no}
                </Link>
              </td>
              <td className="py-2 pr-4">{r.title || '—'}</td>
              <td className="py-2 pr-4 whitespace-nowrap">{r.customer_name || '—'}</td>
              <td className="py-2 pr-4 text-gray-600 max-w-[420px]">
                {truncate(r.description, 120)}
              </td>
              <td className="py-2 pr-4">
                <StatusBadge status={r.status} />
              </td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {r.created_at ? timeAgoTR(new Date(r.created_at)) : '—'}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-500">
                Kayıt yok.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    open: { text: 'Yeni', cls: 'text-green-700 bg-green-100' },
    in_progress: { text: 'Devam Ediyor', cls: 'text-blue-700 bg-blue-100' },
    completed: { text: 'Tamamlandı', cls: 'text-gray-700 bg-gray-200' },
    frozen: { text: 'Donduruldu', cls: 'text-amber-800 bg-amber-100' },
    canceled: { text: 'İptal', cls: 'text-rose-800 bg-rose-100' },
  }
  const m = map[status] ?? { text: status, cls: 'text-gray-700 bg-gray-100' }
  return (
    <span className={`px-2 py-1 rounded text-xs ${m.cls}`}>{m.text}</span>
  )
}

function truncate(s: string, n: number) {
  if (!s) return '—'
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

// Türkçe relative time (dakikaya kadar)
function timeAgoTR(date: Date) {
  const diff = Date.now() - date.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 10) return 'az önce'
  if (sec < 60) return `${sec} sn önce`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} dk önce`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} saat önce`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} gün önce`
  const week = Math.floor(day / 7)
  if (week < 5) return `${week} hf önce`
  const month = Math.floor(day / 30)
  if (month < 12) return `${month} ay önce`
  const year = Math.floor(day / 365)
  return `${year} yıl önce`
}
