 'use client';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type T = { id:number; name:string; default_role:string; order_index:number };

function Page() {
  const [items, setItems] = useState<T[]>([]);
  const [name, setName] = useState('Keşif');
  const [role, setRole] = useState('Müşteri Temsilcisi');

  const load = async ()=>{
    const data = await api<T[]>('/processes/');
    setItems(data);
  }
  useEffect(()=>{ load(); }, []);

  const add = async ()=>{
    await api('/processes/', { method:'POST', body: JSON.stringify({ name, default_role: role, order_index: items.length }) });
    setName(''); setRole('');
    load();
  }
  const del = async (id:number)=>{
    await api('/processes/'+id, { method:'DELETE' });
    load();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Süreç Adımı Ekle</h2>
        <label className="label">Ad</label>
        <input className="input mb-3" value={name} onChange={e=>setName(e.target.value)} />
        <label className="label">Varsayılan Rol</label>
        <input className="input mb-4" value={role} onChange={e=>setRole(e.target.value)} />
        <button className="btn" onClick={add}>Ekle</button>
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Süreç Şablonları</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>#</th><th>Ad</th><th>Rol</th><th></th></tr></thead>
          <tbody>
            {items.map((t,i)=>(
              <tr key={t.id} className="border-t">
                <td className="py-2">{i+1}</td>
                <td>{t.name}</td>
                <td>{t.default_role}</td>
                <td className="text-right"><button className="text-red-600" onClick={()=>del(t.id)}>Sil</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default (props:any)=> <RequireAuth><Page {...props} /></RequireAuth>
