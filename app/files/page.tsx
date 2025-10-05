
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type Node = Record<string, { name:string; key:string; url:string; id:number }[]>;

function Inner(){
  const [jobId, setJobId] = useState(1);
  const [tree, setTree] = useState<Node>({});
  const load = async()=> setTree(await api(`/files/tree/${jobId}`));
  useEffect(()=>{ load(); }, [jobId]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div><div className="label">Job ID</div><input type="number" className="input w-32" value={jobId} onChange={e=>setJobId(Number(e.target.value))} /></div>
        <button className="btn" onClick={load}>Yenile</button>
      </div>
      <div className="card p-4">
        {Object.keys(tree).length===0 && <div className="text-sm text-gray-500">Dosya yok.</div>}
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(tree).map(([folder, files])=>(
            <div key={folder} className="border rounded p-3">
              <div className="font-medium mb-2">{folder}</div>
              <ul className="text-sm space-y-1">
                {files.map(f=>(<li key={f.id} className="flex items-center justify-between border-b py-1"><span className="truncate">{f.name}</span><a href={f.url} className="link" target="_blank">Aç</a></li>))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page(){ return <RequireAuth><Inner /></RequireAuth> }
