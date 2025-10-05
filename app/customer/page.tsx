'use client';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Customer = { id: number; name: string; contact?: string };

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  const load = async () => setItems(await api('/api/customers'));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await api('/api/customers', { method: 'POST', body: JSON.stringify({ name, contact }) });
    setName(''); setContact(''); load();
  };

  const save = async (c: Customer) => {
    await api(`/api/customers/${c.id}`, { method: 'PATCH', body: JSON.stringify({ name: c.name, contact: c.contact }) });
    load();
  };

  const del = async (id: number) => {
    if (!confirm('Silinsin mi?')) return;
    await api(`/api/customers/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <RequireAuth>
      <div className="space-y-4">
        <div className="card p-4 grid md:grid-cols-3 gap-3">
          <div>
            <div className="label">Müşteri Adı</div>
            <input className="input w-full" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <div className="label">İletişim</div>
            <input className="input w-full" value={contact} onChange={e => setContact(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn" onClick={add}>Ekle</button>
          </div>
        </div>

        <div className="card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left"><th>#</th><th>Ad</th><th>İletişim</th><th className="text-right">İşlem</th></tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="py-2">{c.id}</td>
                  <td>
                    <input className="input" value={c.name}
                      onChange={e => setItems(xs => xs.map(x => x.id===c.id ? { ...x, name: e.target.value } : x))} />
                  </td>
                  <td>
                    <input className="input" value={c.contact || ''}
                      onChange={e => setItems(xs => xs.map(x => x.id===c.id ? { ...x, contact: e.target.value } : x))} />
                  </td>
                  <td className="text-right">
                    <button className="btn mr-2" onClick={() => save(c)}>Kaydet</button>
                    <button className="text-red-600" onClick={() => del(c.id)}>Sil</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="py-3 text-gray-500">Kayıt yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}
