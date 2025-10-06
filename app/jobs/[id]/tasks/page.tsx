'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

type Step = {
  id:number; job_id:number; name:string|null; status:string;
  est_duration_hours:number|null; required_qty:number|null; produced_qty:number|null;
  assignee_id: string | null;
};

type Job = { id:number; job_no:string; title:string; customer_id:number|null };
type Customer = { id:number; name:string };

export default function StepsByJobPage({ params }: { params: { id: string }}) {
  const jobId = Number(params.id);
  const [steps, setSteps] = useState<Step[]>([]);
  const [job, setJob] = useState<Job|null>(null);
  const [customer, setCustomer] = useState<Customer|null>(null);
  const [loading, setLoading] = useState(true);

  const load = async ()=> {
    setLoading(true);
    const s = await api<Step[]>(`/api/steps/by-job/${jobId}`);
    setSteps(s);
    const j = await api<Job>(`/api/job-brief/${jobId}`).catch(()=>null as any);
    if (j) {
      setJob(j);
      if (j.customer_id) {
        const c = await api<Customer>(`/api/customers/${j.customer_id}`).catch(()=>null as any);
        setCustomer(c || null);
      } else {
        setCustomer(null);
      }
    }
    setLoading(false);
  };

  useEffect(()=>{ load(); }, []);

  const patch = async (id:number, body:any)=>{
    await api(`/api/steps/${id}`, { method:'PATCH', body });
    await load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">İş Talebi #{jobId} – Görevler</h2>
        <div className="flex gap-2">
          <Link className="btn" href={`/jobs/${jobId}`}>Talep Detayı</Link>
          <Link className="btn" href="/jobs">Tüm Talepler</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Müşteri</div>
          <div className="font-medium">{customer?.name ?? '-'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Talep No</div>
          <div className="font-mono">{job?.job_no ?? '-'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Talep Başlığı</div>
          <div className="font-medium">{job?.title ?? '-'}</div>
        </div>
      </div>

      <div className="card p-4 overflow-auto">
        {loading && <div>Yükleniyor...</div>}
        {!loading && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Görev</th>
                <th>Durum</th>
                <th>Gereksinim</th>
                <th>Üretilen</th>
                <th>Süre (saat)</th>
                <th className="text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {steps.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="py-2">{s.name ?? '-'}</td>
                  <td>{s.status}</td>
                  <td>{s.required_qty ?? '-'}</td>
                  <td>{s.produced_qty ?? '-'}</td>
                  <td>{s.est_duration_hours ?? '-'}</td>
                  <td className="text-right space-x-2">
                    <button className="btn" onClick={()=>patch(s.id,{ status:'in_progress' })}>Başlat</button>
                    <button className="btn" onClick={()=>patch(s.id,{ status:'pending' })}>Beklet</button>
                    <button className="btn" onClick={()=>patch(s.id,{ status:'done' })}>Tamamla</button>
                  </td>
                </tr>
              ))}
              {steps.length === 0 && (
                <tr><td colSpan={6} className="py-3 text-gray-500">Bu talebe bağlı görev bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
