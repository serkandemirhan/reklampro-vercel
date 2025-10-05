
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type Log = { id:number; step_id:number; step:string; message:string; created_at:string };

function Inner(){
  const [jobId, setJobId] = useState(1);
  const [items, setItems] = useState<Log[]>([]);
  const load = async()=> setItems(await api(`/logs/by-job/${jobId}`));
  useEffect(()=>{ load(); }, [jobId]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div><div className="label">Job ID</div><input type="number" className="input w-32" value={jobId} onChange={e=>setJobId(Number(e.target.value))} /></div>
        <button className="btn" onClick={load}>Yenile</button>
      </div>
      <div className="card p-4">
        <div className="space-y-3">
          {items.map(l=>(
            <div key={l.id} className="border-l-4 border-primary pl-3">
              <div className="text-sm"><span className="font-medium">{l.step}</span> — {l.message}</div>
              <div className="text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</div>
            </div>
          ))}
          {items.length===0 && <div className="text-sm text-gray-500">Log yok.</div>}
        </div>
      </div>
    </div>
  );
}

export default function Page(){ return <RequireAuth><Inner /></RequireAuth> }
