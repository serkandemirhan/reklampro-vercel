'use client';

import RequireAuth from '@/components/RequireAuth';
import StatusBadge from '@/components/ui/status-badge';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

type ProcessRow = {
  id: number;
  name: string;
  default_role: string;
  order_index: number;
  is_parallel: boolean;
  is_machine_based: boolean;
  is_production: boolean;
};

type MachineRow = {
  id: number;
  name: string;
  process_id: number | null;
  status: 'active' | 'maintenance' | 'inactive';
  note: string;
  process_name?: string | null;
};

type RoleOption = { id: number; name: string };

const MACHINE_STATUSES: { value: MachineRow['status']; label: string; tone: 'success' | 'warning' | 'muted' }[] = [
  { value: 'active', label: 'Aktif', tone: 'success' },
  { value: 'maintenance', label: 'Bakımda', tone: 'warning' },
  { value: 'inactive', label: 'Pasif', tone: 'muted' },
];

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<ProcessRow[]>([]);
  const [machines, setMachines] = useState<MachineRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newProcess, setNewProcess] = useState<ProcessRow>({
    id: 0,
    name: '',
    default_role: '',
    order_index: processes.length + 1,
    is_parallel: false,
    is_machine_based: false,
    is_production: false,
  });

  const [newMachine, setNewMachine] = useState<MachineRow>({
    id: 0,
    name: '',
    process_id: null,
    status: 'active',
    note: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [procRes, machineRes, roleRes] = await Promise.all([
        api<ProcessRow[]>('/api/processes'),
        api<MachineRow[]>('/api/machines'),
        api<{ processes: any[]; roles: any[] }>('/api/admin/roles'),
      ]);
      setProcesses(procRes ?? []);
      setMachines(machineRes ?? []);
      setRoles((roleRes.roles ?? []).map((r: any) => ({ id: r.id, name: r.name })));
    } catch (err: any) {
      alert(err?.message || 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setNewProcess((prev) => {
      if (prev.id !== 0) return prev;
      if (prev.name.trim() || prev.default_role.trim()) return prev;
      return { ...prev, order_index: processes.length + 1 };
    });
  }, [processes.length]);

  const processRoleOptions = useMemo(() => {
    if (roles.length === 0) return [];
    return roles;
  }, [roles]);

  const updateProcessField = (id: number, field: keyof ProcessRow, value: any) => {
    setProcesses((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'name' || field === 'default_role' ? String(value) : value,
            }
          : item
      )
    );
  };

  const saveProcess = async (row: ProcessRow) => {
    setSaving(true);
    try {
      await api(`/api/processes/${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: row.name,
          default_role: row.default_role,
          order_index: row.order_index ?? 0,
          is_parallel: row.is_parallel,
          is_machine_based: row.is_machine_based,
          is_production: row.is_production,
        }),
      });
    } catch (err: any) {
      alert(err?.message || 'Süreç güncellenemedi');
    } finally {
      setSaving(false);
      load();
    }
  };

  const deleteProcess = async (id: number) => {
    if (!confirm('Süreç silinsin mi?')) return;
    setSaving(true);
    try {
      await api(`/api/processes/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      alert(err?.message || 'Süreç silinemedi');
    } finally {
      setSaving(false);
      load();
    }
  };

  const addProcess = async () => {
    if (!newProcess.name.trim()) {
      alert('Süreç adı zorunludur');
      return;
    }
    setSaving(true);
    try {
      await api('/api/processes', {
        method: 'POST',
        body: JSON.stringify({
          name: newProcess.name.trim(),
          default_role: newProcess.default_role,
          order_index: newProcess.order_index ?? processes.length + 1,
          is_parallel: newProcess.is_parallel,
          is_machine_based: newProcess.is_machine_based,
          is_production: newProcess.is_production,
        }),
      });
      setNewProcess({
        id: 0,
        name: '',
        default_role: '',
        order_index: processes.length + 2,
        is_parallel: false,
        is_machine_based: false,
        is_production: false,
      });
      load();
    } catch (err: any) {
      alert(err?.message || 'Süreç eklenemedi');
    } finally {
      setSaving(false);
    }
  };

  const updateMachineField = (id: number, field: keyof MachineRow, value: any) => {
    setMachines((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'name' || field === 'note' ? String(value) : value,
            }
          : item
      )
    );
  };

  const saveMachine = async (row: MachineRow) => {
    setSaving(true);
    try {
      await api(`/api/machines/${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: row.name,
          process_id: row.process_id,
          status: row.status,
          note: row.note,
        }),
      });
    } catch (err: any) {
      alert(err?.message || 'Makine güncellenemedi');
    } finally {
      setSaving(false);
      load();
    }
  };

  const deleteMachine = async (id: number) => {
    if (!confirm('Makine silinsin mi?')) return;
    setSaving(true);
    try {
      await api(`/api/machines/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      alert(err?.message || 'Makine silinemedi');
    } finally {
      setSaving(false);
      load();
    }
  };

  const addMachine = async () => {
    if (!newMachine.name.trim()) {
      alert('Makine adı zorunludur');
      return;
    }
    setSaving(true);
    try {
      await api('/api/machines', {
        method: 'POST',
        body: JSON.stringify({
          name: newMachine.name.trim(),
          process_id: newMachine.process_id,
          status: newMachine.status,
          note: newMachine.note,
        }),
      });
      setNewMachine({ id: 0, name: '', process_id: null, status: 'active', note: '' });
      load();
    } catch (err: any) {
      alert(err?.message || 'Makine eklenemedi');
    } finally {
      setSaving(false);
    }
  };

  const machineStatusMeta = useMemo(
    () =>
      MACHINE_STATUSES.reduce(
        (acc, item) => {
          acc[item.value] = item;
          return acc;
        },
        {} as Record<MachineRow['status'], (typeof MACHINE_STATUSES)[number]>
      ),
    []
  );

  const newMachineStatus = machineStatusMeta[newMachine.status] ?? MACHINE_STATUSES[0];

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Genel Süreç ve Makine Yönetimi</h1>
            <p className="text-sm text-gray-500">Süreç adımlarını ve üretim makinelerini tek ekrandan planlayın.</p>
          </div>
          <button
            className="btn-ghost disabled:cursor-not-allowed disabled:opacity-60"
            onClick={load}
            disabled={loading || saving}
          >
            {loading ? 'Yükleniyor…' : '↻ Yenile'}
          </button>
        </div>

        <section className="card space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Süreç Yönetimi</h2>
              <p className="text-sm text-gray-500">
                Bu tablo yeni iş talebi oluştururken otomatik gelen süreç şablonlarını belirler.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span className="text-base leading-none text-gray-400">[ ]</span> Hayır
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-base leading-none text-primary">[✔]</span> Evet
              </span>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[1040px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-10 px-3 py-3 text-center">↕</th>
                  <th className="w-16 px-3 py-3 text-center">#</th>
                  <th className="px-3 py-3 text-left">Süreç Adı</th>
                  <th className="px-3 py-3 text-left">Varsayılan Rol</th>
                  <th className="px-3 py-3 text-center">Paralel</th>
                  <th className="px-3 py-3 text-center">Makine Bazlı</th>
                  <th className="px-3 py-3 text-center">Üretim</th>
                  <th className="w-24 px-3 py-3 text-center">Sıra</th>
                  <th className="w-40 px-3 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 transition-colors hover:bg-slate-50">
                    <td className="px-3 py-3 text-center align-middle text-lg text-gray-300">↕</td>
                    <td className="px-3 py-3 text-center align-middle font-semibold text-gray-600">{row.id}</td>
                    <td className="px-3 py-3 align-middle">
                      <input
                        className="input w-full"
                        value={row.name}
                        placeholder="Örn: Baskı"
                        onChange={(e) => updateProcessField(row.id, 'name', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <select
                        className="input w-full"
                        value={row.default_role ?? ''}
                        onChange={(e) => updateProcessField(row.id, 'default_role', e.target.value)}
                      >
                        <option value="">Rol seçin</option>
                        {processRoleOptions.map((opt) => (
                          <option key={opt.id} value={opt.name}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={row.is_parallel}
                        onChange={(e) => updateProcessField(row.id, 'is_parallel', e.target.checked)}
                        aria-label="Paralel süreç"
                      />
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={row.is_machine_based}
                        onChange={(e) => updateProcessField(row.id, 'is_machine_based', e.target.checked)}
                        aria-label="Makine bazlı süreç"
                      />
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={row.is_production}
                        onChange={(e) => updateProcessField(row.id, 'is_production', e.target.checked)}
                        aria-label="Üretim süreci"
                      />
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      <input
                        className="input w-24 text-center"
                        type="number"
                        value={row.order_index ?? 0}
                        onChange={(e) => updateProcessField(row.id, 'order_index', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-3 py-3 text-right align-middle">
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn btn-sm disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => saveProcess(row)}
                          disabled={saving}
                        >
                          Güncelle
                        </button>
                        <button
                          className="btn-ghost text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => deleteProcess(row.id)}
                          disabled={saving}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {processes.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-gray-500">
                      Tanımlı süreç bulunamadı.
                    </td>
                  </tr>
                )}
                <tr className="border-t bg-slate-50">
                  <td className="px-3 py-3 text-center text-lg text-gray-400">+</td>
                  <td className="px-3 py-3 text-center text-xs uppercase text-gray-400">Yeni</td>
                  <td className="px-3 py-3">
                    <input
                      className="input w-full"
                      placeholder="Örn: Laminasyon"
                      value={newProcess.name}
                      onChange={(e) => setNewProcess((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="input w-full"
                      value={newProcess.default_role}
                      onChange={(e) => setNewProcess((prev) => ({ ...prev, default_role: e.target.value }))}
                    >
                      <option value="">Rol seçin</option>
                      {processRoleOptions.map((opt) => (
                        <option key={opt.id} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={newProcess.is_parallel}
                      onChange={(e) => setNewProcess((prev) => ({ ...prev, is_parallel: e.target.checked }))}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={newProcess.is_machine_based}
                      onChange={(e) => setNewProcess((prev) => ({ ...prev, is_machine_based: e.target.checked }))}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={newProcess.is_production}
                      onChange={(e) => setNewProcess((prev) => ({ ...prev, is_production: e.target.checked }))}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      className="input w-24 text-center"
                      type="number"
                      value={newProcess.order_index}
                      onChange={(e) => setNewProcess((prev) => ({ ...prev, order_index: Number(e.target.value) }))}
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      className="btn disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={addProcess}
                      disabled={saving}
                    >
                      {saving ? 'Ekleniyor…' : 'Süreç Ekle'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Makine Yönetimi</h2>
              <p className="text-sm text-gray-500">
                Makineleri süreçlere bağlayarak operatör ekranındaki filtrelerin doğru çalışmasını sağlayın.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {MACHINE_STATUSES.map((status) => (
                <StatusBadge key={status.value} tone={status.tone}>
                  {status.label}
                </StatusBadge>
              ))}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-10 px-3 py-3 text-center">↕</th>
                  <th className="w-16 px-3 py-3 text-center">#</th>
                  <th className="px-3 py-3 text-left">Makine Adı</th>
                  <th className="px-3 py-3 text-left">Bağlı Süreç</th>
                  <th className="px-3 py-3 text-left">Durum</th>
                  <th className="px-3 py-3 text-left">Not</th>
                  <th className="w-40 px-3 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((row) => {
                  const statusMeta = machineStatusMeta[row.status] ?? MACHINE_STATUSES[0];
                  return (
                    <tr key={row.id} className="border-b last:border-0 transition-colors hover:bg-slate-50">
                      <td className="px-3 py-3 text-center align-middle text-lg text-gray-300">↕</td>
                      <td className="px-3 py-3 text-center align-middle font-semibold text-gray-600">{row.id}</td>
                      <td className="px-3 py-3 align-middle">
                        <input
                          className="input w-full"
                          value={row.name}
                          placeholder="Örn: HP Latex 360"
                          onChange={(e) => updateMachineField(row.id, 'name', e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <select
                          className="input w-full"
                          value={row.process_id ?? ''}
                          onChange={(e) => updateMachineField(row.id, 'process_id', e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">(Bağlantı yok)</option>
                          {processes.map((proc) => (
                            <option key={proc.id} value={proc.id}>
                              {proc.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
                          <select
                            className="input"
                            value={row.status}
                            onChange={(e) => updateMachineField(row.id, 'status', e.target.value as MachineRow['status'])}
                          >
                            {MACHINE_STATUSES.map((st) => (
                              <option key={st.value} value={st.value}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <input
                          className="input w-full"
                          value={row.note ?? ''}
                          placeholder="Örn: Parça bekleniyor"
                          onChange={(e) => updateMachineField(row.id, 'note', e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-3 text-right align-middle">
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-sm disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => saveMachine(row)}
                            disabled={saving}
                          >
                            Güncelle
                          </button>
                          <button
                            className="btn-ghost text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => deleteMachine(row.id)}
                            disabled={saving}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {machines.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                      Tanımlı makine bulunamadı.
                    </td>
                  </tr>
                )}
                <tr className="border-t bg-slate-50">
                  <td className="px-3 py-3 text-center text-lg text-gray-400">+</td>
                  <td className="px-3 py-3 text-center text-xs uppercase text-gray-400">Yeni</td>
                  <td className="px-3 py-3">
                    <input
                      className="input w-full"
                      placeholder="Örn: CNC Router A"
                      value={newMachine.name}
                      onChange={(e) => setNewMachine((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="input w-full"
                      value={newMachine.process_id ?? ''}
                      onChange={(e) => setNewMachine((prev) => ({ ...prev, process_id: e.target.value ? Number(e.target.value) : null }))}
                    >
                      <option value="">(Bağlantı yok)</option>
                      {processes.map((proc) => (
                        <option key={proc.id} value={proc.id}>
                          {proc.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={newMachineStatus.tone}>{newMachineStatus.label}</StatusBadge>
                      <select
                        className="input"
                        value={newMachine.status}
                        onChange={(e) => setNewMachine((prev) => ({ ...prev, status: e.target.value as MachineRow['status'] }))}
                      >
                        {MACHINE_STATUSES.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="input w-full"
                      placeholder="Not"
                      value={newMachine.note}
                      onChange={(e) => setNewMachine((prev) => ({ ...prev, note: e.target.value }))}
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      className="btn disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={addMachine}
                      disabled={saving}
                    >
                      {saving ? 'Ekleniyor…' : 'Makine Ekle'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </RequireAuth>
  );
}
