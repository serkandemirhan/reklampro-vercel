
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type User = { id:string; email?:string; app_metadata?:any };

function Inner(){
  const [items, setItems] = useState<User[]>([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('manager');
  const [tenant, setTenant] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const load = async()=> setItems(await api(`/admin/users${q?`?q=${encodeURIComponent(q)}`:''}`));
  useEffect(()=>{ load(); }, []);

  const apply = async()=>{
    if (!selected) return;
    await api(`/admin/users/set-metadata?user_id=${encodeURIComponent(selected)}&role=${encodeURIComponent(role)}&tenant_id=${tenant}`, { method:'POST' });
    alert('Rol/tenant atandı');
    load();
  };

  return (
    <div className="space-y-4">
      <div className="card p-4 flex gap-2">
        <input className="input" placeholder="E-posta ara" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="btn" onClick={load}>Ara</button>
      </div>
      <div className="card p-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>ID</th><th>E-posta</th><th>Rol</th><th>Tenant</th><th></th></tr></thead>
          <tbody>
            {items.map(u=>{
              const m = u.app_metadata || {};
              return (
                <tr key={u.id} className="border-t">
                  <td className="py-2">{u.id}</td>
                  <td>{u.email}</td>
                  <td>{m.role || '-'}</td>
                  <td>{m.tenant_id ?? '-'}</td>
                  <td className="text-right">
                    <button className="link" onClick={()=>setSelected(u.id)}>Seç</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="card p-4">
        <div className="font-medium mb-2">Seçili Kullanıcıya Rol/Tenant Ata</div>
        <div className="grid md:grid-cols-3 gap-3">
          <div><div className="label">Kullanıcı ID</div><input className="input" value={selected || ''} onChange={e=>setSelected(e.target.value)} /></div>
          <div><div className="label">Rol</div><input className="input" value={role} onChange={e=>setRole(e.target.value)} /></div>
          <div><div className="label">Tenant</div><input type="number" className="input" value={tenant} onChange={e=>setTenant(Number(e.target.value))} /></div>
        </div>
        <div className="mt-3"><button className="btn" onClick={apply}>Uygula</button></div>
      </div>
    </div>
  );
}

export default function Page(){ return <RequireAuth><Inner /></RequireAuth> }
