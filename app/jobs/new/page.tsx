'use client';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Customer = { id: number; name: string };
type Proc = { id: number; name: string };

export default function NewJobPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [procs, setProcs] = useState<Proc[]>([]);
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [title, setTitle] = useState('Proje Talebi');
  const [desc, setDesc] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [estHours, setEstHours] = useState<Record<number, number>>({});
  const [requiredQty, setRequiredQty] = useState<Record<number, number>>({});

  useEffect(() => {
    (async () => {
      setCustomers(await api('/api/customers'));
      setProcs(await api('/api/processes'));
    })();
  }, []);

  const toggle = (id: number) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const submit = async () => {
    if (!customerId || !title.trim() || selected.length === 0) {
      alert('Müşteri, başlık ve en az bir süreç seçmelisiniz'); return;
    }
    const steps = selected.map(id => ({
      template_id: id,
      est_duration_hours: estHours[id] ?? null,
      required_qty: requiredQty[id] ?? null
    }));
    await api('/api/jobs', {
      method: 'POST',
      body: JSON.stringify({ customer_id: Number(customerId), title, description: desc, steps })
    });
    alert('İş talebi oluşturuldu');
    setCustomerId(''); setTitle('Proje Talebi'); setDesc(''); setSelected([]);
    setEstHours({}); setRequiredQty({});
  };

  return (
    <RequireAuth>
      <div className="card p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="label">Müşteri</div>
            <select className="input w-full" value={customerId} onChange={e => setCustomerId(Number(e.target.value))}>
              <option value="">Seçin</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="label">Talep Başlığı</div>
            <input className="input w-full" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
        </div>

        <div>
          <div className="label">Açıklama</div>
          <textarea className="input w-full" rows={4} value={desc} onChange={e => setDesc(e.target.value)} />
        </div>

        <div>
          <div className="label mb-2">Süreç Seçimi</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Süreç</th><th>Seç</th><th>Tah. Süre (saat)</th><th>Gereksinim</th>
              </tr>
            </thead>
            <tbody>
              {procs.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.name}</td>
                  <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} /></td>
                  <td><input className="input w-28" type="number" value={estHours[p.id] ?? ''} onChange={e => setEstHours(x => ({ ...x, [p.id]: Number(e.target.value) }))} /></td>
                  <td><input className="input w-28" type="number" value={requiredQty[p.id] ?? ''} onChange={e => setRequiredQty(x => ({ ...x, [p.id]: Number(e.target.value) }))} /></td>
                </tr>
              ))}
              {procs.length === 0 && <tr><td colSpan={4} className="py-3 text-gray-500">Süreç bulunamadı.</td></tr>}
            </tbody>
          </table>
        </div>

        <div><button className="btn" onClick={submit}>Talebi Kaydet ve Süreci Başlat</button></div>
      </div>
    </RequireAuth>
  );
}
