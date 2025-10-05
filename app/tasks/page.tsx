'use client';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Row = {
  id: number;
  name: string | null;
  status: string;
  required_qty: number | null;
  produced_qty: number | null;
  est_duration_hours: number | null;
  assignee_id: string | null;
  job_id: number;
  job_no: string;
  job_title: string;
  customer_name: string;
  created_at: string | null;
}

export default function TasksPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [status, setStatus] = useState<string>('')   // '', pending, in_progress, done
  const [q, setQ] = useState('')

  const load = async () => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    const data = await api<Row[]>(`/api/steps${params.toString() ? `?${params.toString()}` : ''}`)
    setRows(data)
  }

  useEffect(() => { load() }, []) // ilk yükleme

  return (
    <RequireAuth>
      <div className="space-y-4">
        <div className="card p-4 grid md:grid-cols-4 gap-3">
          <div>
            <div className="label">Durum</div>
            <select className="input w-full" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Tümü</option>
              <option value="pending">Bekliyor</option>
              <option value="in_progress">Devam ediyor</option>
              <option value="done">Tamamlandı</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <div className="label">Ara</div>
            <input className="input w-full" placeholder="Müşteri, Talep No, Başlık, Görev adı..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn" onClick={load}>Uygula</button>
          </div>
        </div>

        <div className="card p-4 overflow-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left">
                <th>Talep No</th>
                <th>Müşteri</th>
                <th>Talep Başlığı</th>
                <th>Görev</th>
                <th>Durum</th>
                <th>Gereksinim</th>
                <th>Üretilen</th>
                <th>Tah. Süre</th>
                <th>Oluşturma</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 font-mono">{r.job_no}</td>
                  <td>{r.customer_name || '-'}</td>
                  <td>{r.job_title}</td>
                  <td>{r.name || '-'}</td>
                  <td>{r.status}</td>
                  <td>{r.required_qty ?? '-'}</td>
                  <td>{r.produced_qty ?? '-'}</td>
                  <td>{r.est_duration_hours ?? '-'}</td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="py-3 text-gray-500">Kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  )
}
