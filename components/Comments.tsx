
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Comment = { id:number; job_id:number; step_id:number|null; author_id:number; body:string };

export default function Comments({ jobId, stepId }: { jobId:number; stepId?:number }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [body, setBody] = useState('');

  const load = async()=> setItems(await api(`/comments/by-job/${jobId}`));
  useEffect(()=>{ load(); }, [jobId]);

  const add = async()=>{
    if (!body.trim()) return;
    await api('/comments/', { method:'POST', body: JSON.stringify({ job_id: jobId, step_id: stepId || null, body }) });
    setBody(''); load();
  };

  return (
    <div className="space-y-2">
      <div className="font-medium">Yorumlar</div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {items.map(c=>(<div key={c.id} className="border rounded p-2 text-sm"><span className="text-gray-500">#{c.id}</span> {c.body}</div>))}
        {items.length===0 && <div className="text-sm text-gray-500">Yorum yok.</div>}
      </div>
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="@kisi@firma.com mesaj..." value={body} onChange={e=>setBody(e.target.value)} />
        <button className="btn" onClick={add}>Gönder</button>
      </div>
    </div>
  );
}
