'use client';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Process = { id: number; name: string; default_role: string; order_index: number };

export default function ProcessesPage() {
  const [items, setItems] = useState<Process[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('operator');
  const [order, setOrder] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await api<Process[]>('/api/processes'); // ✅ API route
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api('/api/processes', {                 // ✅ API route
        method: 'POST',
        body: JSON.stringify({
          name,
          default_role: role,
          order_index: Number.isFinite(order) ? Number(order) : 0,
        }),
      });
      setName('');
      setRole('operator');
      setOrder(0);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Kayıt sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="space-y-4">
        <div className="card p-4 grid md:grid-cols-3 gap-3">
          <div>
            <div className="label">Süreç adı</div>
            <input
              className="input w-full"
              placeholder="Örn: Keşif"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <div className="label">Varsayılan rol</div>
            <input
              className="input w-full"
              placeholder="Örn: Operatör"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <div className="label">Sıra</div>
            <input
              className="input w-full"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          <div className="md:col-span-3">
            <button className="btn" onClick={add} disabled={loading}>
              {loading ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </div>

        <div className="card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 w-16">#</th>
                <th>Ad</th>
                <th>Varsayılan Rol</th>
                <th className="w-24 text-right">Sıra</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.default_role}</td>
                  <td className="text-right">{p.order_index}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-gray-500">
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}
