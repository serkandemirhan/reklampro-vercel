
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type Perm = { id:number; role:string; resource:string; action:string; allow:boolean };

function Inner(){
  const [items, setItems] = useState<Perm[]>([]);
  const [role, setRole] = useState('manager');
  const [resource, setResource] = useState('steps');
  const [action, setAction] = useState('write');

  const load = async()=> setItems(await api('/permissions/'));
  useEffect(()=>{ load(); }, []);
  const add = async()=>{
    await api('/permissions/', { method:'POST', body: JSON.stringify({ role, resource, action, allow:true }) });
    load();
  }
  const del = async(id:number)=>{ await api('/permissions/'+id, { method:'DELETE' }); load(); }

  return (
    <div className="space-y-4">
      <div className="card p-4 grid md:grid-cols-4 gap-3">
        <div><div className="label">Rol</div><input className="input" value={role} onChange={e=>setRole(e.target.value)} /></div>
        <div><div className="label">Kaynak</div><input className="input" value={resource} onChange={e=>setResource(e.target.value)} /></div>
        <div><div className="label">Aksiyon</div><input className="input" value={action} onChange={e=>setAction(e.target.value)} /></div>
        <div className="flex items-end"><button className="btn" onClick={add}>İzin Ekle</button></div>
      </div>
      <div className="card p-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Rol</th><th>Kaynak</th><th>Aksiyon</th><th>Allow</th><th></th></tr></thead>
          <tbody>
            {items.map(p=>(
              <tr key={p.id} className="border-t">
                <td className="py-2">{p.role}</td>
                <td>{p.resource}</td>
                <td>{p.action}</td>
                <td>{String(p.allow)}</td>
                <td className="text-right"><button className="text-red-600" onClick={()=>del(p.id)}>Sil</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Page(){ return <RequireAuth><Inner /></RequireAuth> }
