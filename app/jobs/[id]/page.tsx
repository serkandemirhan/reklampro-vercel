
'use client';
import { useEffect, useState } from 'react';
import { api, API_BASE } from '@/lib/api';
import Dropzone from '@/components/Dropzone';
import Comments from '@/components/Comments';

type FileItem = { id:number; key:string; name:string; url:string };
type Step = {
  id:number; job_id:number; name:string; status:string;
  assigned_role:string; assignee_id:number|null;
  est_duration_hours:number|null; required_qty:number|null; produced_qty:number|null;
}

export default function Page({ params }: { params: { id: string }}) {
  const jobId = Number(params.id);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [message, setMessage] = useState<string>('');

  const load = async()=>{
    const data = await api<Step[]>(`/steps/by-job/${jobId}`);
    setSteps(data);
    const fl = await api<FileItem[]>(`/files/by-job/${jobId}`);
    setFiles(fl);
  }
  useEffect(()=>{ load();
    const ws = new WebSocket((process.env.NEXT_PUBLIC_API_BASE || 'ws://localhost:8000').replace('http','ws') + '/ws');
    ws.onmessage = ev => {
      try { const data = JSON.parse(ev.data); if (data.type === 'step.updated') load(); } catch {}
    };
    return ()=> ws.close();
  }, [jobId]);

  const patch = async (id:number, body:any)=>{
    await api(`/steps/${id}`, { method:'PATCH', body: JSON.stringify(body) });
    setMessage('Güncellendi ✔️'); load();
  }

  const register = async (key:string, original_name:string, stepId?:number)=>{
    await api('/files/register?job_id='+jobId+'&step_id='+(stepId||'')+'&key='+encodeURIComponent(key)+'&original_name='+encodeURIComponent(original_name), { method:'POST' });
    load();
  }

  const download = async (key:string)=>{
    const d = await api<{url:string}>(`/files/download-url?key=${encodeURIComponent(key)}`);
    window.open(d.url, '_blank');
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Görev Detayları (Job #{jobId})</h2>
      {message && <div className="text-green-700">{message}</div>}

      <div className="card p-4">
        <h3 className="font-medium mb-2">Dosyalar</h3>
        {files.length === 0 ? <div className="text-sm text-gray-500">Henüz dosya yok.</div> :
          <ul className="text-sm space-y-1">
            {files.map(f=>(
              <li key={f.id} className="flex items-center justify-between border-b py-1">
                <span className="truncate">{f.name}</span>
                <button className="link" onClick={()=>download(f.key)}>İndir</button>
              </li>
            ))}
          </ul>
        }
      </div>

      <div className="grid gap-4">
        {steps.map(s=>(
          <div key={s.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">Durum: {s.status} · Rol: {s.assigned_role} · Atanan: {s.assignee_id ?? '-'}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={()=>patch(s.id,{ status:'in_progress' })}>Başlat</button>
                <button className="btn" onClick={()=>patch(s.id,{ status:'done' })}>Tamamla</button>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-3 mt-3">
              <div>
                <div className="label">Tahmini Süre (saat)</div>
                <input type="number" className="input" defaultValue={s.est_duration_hours ?? ''} onBlur={e=>patch(s.id,{ est_duration_hours:Number(e.target.value) })} />
              </div>
              <div>
                <div className="label">Toplam Gereksinim</div>
                <input type="number" className="input" defaultValue={s.required_qty ?? ''} onBlur={e=>patch(s.id,{ required_qty:Number(e.target.value) })} />
              </div>
              <div>
                <div className="label">Üretilen</div>
                <input type="number" className="input" defaultValue={s.produced_qty ?? ''} onBlur={e=>patch(s.id,{ produced_qty:Number(e.target.value) })} />
              </div>
              <div>
                <div className="label">Not / Log</div>
                <input className="input" placeholder="Örn: 40 adet tamamlandı" onKeyDown={e=>{ if(e.key==='Enter') patch(s.id,{ log:(e.target as HTMLInputElement).value }) }} />
              </div>
            </div>

            <div className="mt-4">
              <div className="label mb-1">Dosya Yükle (Sürükle-Bırak)</div>
              <Dropzone jobId={jobId} stepId={s.id} />
            </div>

            <div className="mt-4">
              <Comments jobId={jobId} stepId={s.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
