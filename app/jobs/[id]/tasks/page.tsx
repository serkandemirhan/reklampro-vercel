'use client';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Step = {
  id: number;
  job_id: number;
  name: string | null;
  status: 'pending' | 'in_progress' | 'done' | string;
  est_duration_hours: number | null;
  required_qty: number | null;
  produced_qty: number | null;
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
    try {
      setLoading(true);

      // Görevler
      const resSteps = await fetch(`/api/steps/by-job/${jobId}`);
      if (!resSteps.ok) throw new Error(`steps: ${resSteps.status}`);
      const stepsData: Step[] = await resSteps.json();
      setSteps(stepsData);

      // Talep özet
      const resJob = await fetch(`/api/job-brief/${jobId}`);
      if (resJob.ok) {
        const jobData: Job = await resJob.json();
        setJob(jobData);

        // Müşteri
        if (jobData?.customer_id) {
          const resCust = await fetch(`/api/customers/${jobData.customer_id}`);
          setCustomer(resCust.ok ? await resCust.json() : null);
        } else {
          setCustomer(null);
        }
      } else {
        setJob(null);
        setCustomer(null);
      }
    } catch (e) {
      console.error('load error', e);
      setJob(null);
      setCustomer(null);
      setSteps([]);
      alert('Veriler alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, []);

  const patch = async (id:number, body:any)=> {
    try {
      const res = await fetch(`/api/steps/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=> ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      await load();
    } catch (e:any) {
      console.error('PATCH error', e);
      alert('Güncelleme başarısız: ' + (e?.message ?? 'Bilinmeyen hata'));
    }
  };

  return (
    <RequireAuth>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">İş Talebi #{jobId} – Görevler</h2>
          <div className="flex gap-2">
            <Link className="btn" href={`/jobs/${jobId}`}>Talep Detayı</Link>
            <Link className="btn" href="/jobs">Tüm Talepler</Link>
          </div>
        </div>

        {/* Üst bilgi */}
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
    </RequireAuth>
  );
}
