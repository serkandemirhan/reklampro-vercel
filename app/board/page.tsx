
'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type Step = { id:number; job_id:number; name:string; status:'pending'|'in_progress'|'done'; required_qty:number|null; produced_qty:number|null };

function Column({ title, status, steps, onDrop }:{ title:string; status:string; steps:Step[]; onDrop:(id:number)=>void }) {
  return (
    <div className="card p-3 min-h-[300px]" onDragOver={e=>e.preventDefault()} onDrop={(e)=>{ const id=Number(e.dataTransfer.getData('text/plain')); onDrop(id); }}>
      <div className="font-medium mb-2">{title} ({steps.length})</div>
      <div className="space-y-2">
        {steps.map(s=>(
          <div key={s.id}
            className="rounded border bg-white p-2 shadow-sm cursor-grab"
            draggable
            onDragStart={e=>e.dataTransfer.setData('text/plain', String(s.id))}>
            <div className="text-sm font-medium">{s.name}</div>
            <div className="text-xs text-gray-500">#{s.id} · {s.produced_qty ?? 0}/{s.required_qty ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardInner() {
  const [jobId, setJobId] = useState<number>(1);
  const [steps, setSteps] = useState<Step[]>([]);
  const load = async()=> setSteps(await api(`/steps/by-job/${jobId}`));
  useEffect(()=>{ load(); }, [jobId]);

  const columns = useMemo(()=>({
    pending: steps.filter(s=>s.status==='pending'),
    in_progress: steps.filter(s=>s.status==='in_progress'),
    done: steps.filter(s=>s.status==='done'),
  }), [steps]);

  const moveTo = async (stepId:number, status:'pending'|'in_progress'|'done')=>{
    await api(`/steps/${stepId}`, { method:'PATCH', body: JSON.stringify({ status }) });
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div>
          <div className="label">Job ID</div>
          <input type="number" className="input w-32" value={jobId} onChange={e=>setJobId(Number(e.target.value))} />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <Column title="Bekleyen" status="pending" steps={columns.pending} onDrop={(id)=>moveTo(id,'pending')} />
        <Column title="Devam Ediyor" status="in_progress" steps={columns.in_progress} onDrop={(id)=>moveTo(id,'in_progress')} />
        <Column title="Tamamlandı" status="done" steps={columns.done} onDrop={(id)=>moveTo(id,'done')} />
      </div>
    </div>
  );
}

export default function Page(){
  return <RequireAuth><BoardInner /></RequireAuth>
}
