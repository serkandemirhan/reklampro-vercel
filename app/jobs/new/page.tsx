 'use client';
    import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Customer = { id:number; name:string };
type Template = { id:number; name:string; default_role:string };
type StepSel = { checked:boolean; template_id:number; assignee_id?:number; est_duration_hours?:number; required_qty?:number };

function Page() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [customerId, setCustomerId] = useState<number|''>('' as any);
  const [title, setTitle] = useState('Proje Talebi');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<StepSel[]>([]);

  useEffect(()=>{
    (async()=>{
      setCustomers(await api('/customers/'));
      const t = await api<Template[]>('/processes/');
      setTemplates(t);
      setSteps(t.map(x=>({ checked:false, template_id:x.id })));
    })();
  },[]);

  const toggle = (idx:number, key:keyof StepSel, value:any)=>{
    const copy = [...steps]; (copy[idx] as any)[key]=value; setSteps(copy);
  };

  const save = async ()=>{
    const payload = {
      customer_id: Number(customerId),
      title, description,
      steps: steps.filter(s=>s.checked).map(({checked, ...rest})=>rest),
    };
    await api('/jobs/', { method:'POST', body: JSON.stringify(payload) });
    alert('Talep oluşturuldu');
  }

  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Yeni İş Talebi Oluştur</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Müşteri</label>
          <select className="input" value={customerId} onChange={e=>setCustomerId(Number(e.target.value))}>
            <option value="">Seçin</option>
            {customers.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div>
          <label className="label">Talep Başlığı</label>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Açıklama</label>
          <textarea className="input min-h-24" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
      </div>

      <h3 className="mt-6 mb-2 font-medium">Süreç Seçimi</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Süreç</th><th>Seç</th><th>Tah. Süre (saat)</th><th>Gereksinim</th><th>Atanacak Kullanıcı ID</th></tr></thead>
          <tbody>
            {templates.map((t, idx)=>(
              <tr key={t.id} className="border-t">
                <td className="py-2">{t.name}</td>
                <td><input type="checkbox" onChange={e=>toggle(idx,'checked',e.target.checked)} /></td>
                <td><input type="number" className="input" onChange={e=>toggle(idx,'est_duration_hours', Number(e.target.value))} /></td>
                <td><input type="number" className="input" onChange={e=>toggle(idx,'required_qty', Number(e.target.value))} /></td>
                <td><input type="number" className="input" onChange={e=>toggle(idx,'assignee_id', Number(e.target.value))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="btn" onClick={save}>Talebi Kaydet ve Süreci Başlat</button>
      </div>
    </div>
  );
}


export default (props:any)=> <RequireAuth><Page {...props} /></RequireAuth>
