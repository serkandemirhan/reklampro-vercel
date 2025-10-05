'use client';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type U = { id: string; email: string; role: string | null; tenant_id: number | null; created_at?: string };

export default function UsersAdmin() {
  const [items, setItems] = useState<U[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState('operator');
  const [tenantId, setTenantId] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const load = async () => setItems(await api('/api/admin/users'));

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, role, tenant_id: tenantId, email_confirmed: true })
      });
      setEmail(''); setPassword('123456'); setRole('operator'); setTenantId(1);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Kullanıcı oluşturulamadı');
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Silinsin mi?')) return;
    await api(`/api/admin/users/${id}`, { method: 'DELETE' });
    load();
  };

  const save = async (u: U) => {
    await api(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: u.role, tenant_id: u.tenant_id })
    });
    load();
  };

  return (
    <RequireAuth>
      <div className="space-y-4">
        <div className="card p-4 grid md:grid-cols-4 gap-3">
          <div>
            <div className="label">E-posta</div>
            <input className="input w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="kisi@firma.com" />
          </div>
          <div>
            <div className="label">Şifre</div>
            <input className="input w-full" type="text" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <div className="label">Rol</div>
            <select className="input w-full" value={role} onChange={e => setRole(e.target.value)}>
              <option value="operator">operator</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <div className="label">Tenant ID</div>
            <input className="input w-full" type="number" value={tenantId} onChange={e => setTenantId(Number(e.target.value))} />
          </div>
          <div className="md:col-span-4">
            <button className="btn" onClick={add} disabled={loading}>{loading ? 'Ekleniyor...' : 'Kullanıcı Ekle'}</button>
          </div>
        </div>

        <div className="card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left"><th>E-posta</th><th>Rol</th><th>Tenant</th><th className="text-right">İşlem</th></tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="py-2">{u.email}</td>
                  <td>
                    <select className="input" value={u.role ?? ''} onChange={e => setItems(xs => xs.map(x => x.id === u.id ? { ...x, role: e.target.value } as U : x))}>
                      <option value="operator">operator</option>
                      <option value="manager">manager</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <input className="input w-24" type="number" value={u.tenant_id ?? 1} onChange={e => setItems(xs => xs.map(x => x.id === u.id ? { ...x, tenant_id: Number(e.target.value) } as U : x))} />
                  </td>
                  <td className="text-right">
                    <button className="btn mr-2" onClick={() => save(u)}>Kaydet</button>
                    <button className="text-red-600" onClick={() => del(u.id)}>Sil</button>
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
