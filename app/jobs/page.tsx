'use client';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

type Job = { id: number; job_no: string; title: string; customer_id: number | null; created_at: string };

export default function JobsListPage() {
  const [items, setItems] = useState<Job[]>([]);
  const load = async () => setItems(await api('/api/jobs'));
  useEffect(() => { load(); }, []);

  return (
    <RequireAuth>
      <div className="space-y-4">
        <div className="card p-4 flex items-center justify-between">
          <div className="font-medium">İş Talepleri</div>
          <Link className="btn" href="/jobs/new">Yeni İş Talebi</Link>
        </div>

        <div className="card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left"><th>No</th><th>Başlık</th><th>Müşteri</th><th>Oluşturulma</th><th></th></tr>
            </thead>
            <tbody>
              {items.map(j => (
                <tr key={j.id} className="border-t">
                  <td className="py-2 font-mono">{j.job_no}</td>
                  <td>{j.title}</td>
                  <td>{j.customer_id ?? '-'}</td>
                  <td>{new Date(j.created_at).toLocaleString()}</td>
                  <td className="text-right">
                    <Link className="btn" href={`/jobs/${j.id}`}>Detay</Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="py-3 text-gray-500">Kayıt yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}
