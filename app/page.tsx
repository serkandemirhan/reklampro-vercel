
'use client';
import { useEffect, useState } from 'react';
import { api, API_BASE } from '@/lib/api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const [m, setM] = useState<any>({ jobs:0, steps_total:0, steps_pending:0, steps_in_progress:0, steps_done:0 });
  useEffect(()=>{ api('/metrics/summary').then(setM).catch(()=>{}); }, []);

  const pieData = {
    labels: ['Bekleyen','Devam','Tamamlandı'],
    datasets: [{ data: [m.steps_pending, m.steps_in_progress, m.steps_done] }]
  };
  const barData = {
    labels: ['Toplam Adım','Bekleyen','Devam','Tamamlandı'],
    datasets: [{ label: 'Adımlar', data: [m.steps_total, m.steps_pending, m.steps_in_progress, m.steps_done] }]
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="card p-4"><div className="text-sm text-gray-500">İş Sayısı</div><div className="text-3xl font-bold">{m.jobs}</div></div>
        <div className="card p-4"><div className="text-sm text-gray-500">Toplam Adım</div><div className="text-3xl font-bold">{m.steps_total}</div></div>
        <div className="card p-4"><div className="text-sm text-gray-500">Tamamlandı</div><div className="text-3xl font-bold">{m.steps_done}</div></div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4"><Pie data={pieData} /></div>
        <div className="card p-4 md:col-span-2"><Bar data={barData} /></div>
      </div>

      <div className="card p-4 flex gap-3">
        <a className="btn" href={'/api/export/jobs.csv'} target="_blank" rel="noopener">Jobs CSV</a>
        <a className="btn" href={'/api/export/steps.csv'} target="_blank" rel="noopener">Steps Excel</a>
      </div>
    </div>
  );
}
