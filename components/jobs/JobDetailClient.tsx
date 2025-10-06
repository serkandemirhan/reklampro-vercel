// components/jobs/JobDetailClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = {
  id: number
  job_id: number
  name: string
  status?: string | null
  est_duration_hours?: number | null
  required_qty?: number | null
  template_id?: number | null
}

type Customer = { id: number; name: string }

type Props = {
  id: number
  initialTitle: string
  initialDescription: string
  initialStatus: string
  initialCustomerId: number | null
  initialCustomerName: string
  customers: Customer[]
  isAdmin: boolean
  isSuperadmin: boolean
  tenantId: number | null
  createdAt: string | null
  steps: Step[]
}

export default function JobDetailClient(props: Props) {
  const {
    id,
    initialTitle,
    initialDescription,
    initialStatus,
    initialCustomerId,
    initialCustomerName,
    customers,
    isAdmin,
    isSuperadmin,
    tenantId,
    createdAt,
    steps: initialSteps,
  } = props

  const router = useRouter()

  const [title, setTitle] = useState(initialTitle || '')
  const [description, setDescription] = useState(initialDescription || '')
  const [status, setStatus] = useState(initialStatus || 'open')
  const [customerId, setCustomerId] = useState<number | null>(initialCustomerId)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const [steps, setSteps] = useState<Step[]>(initialSteps)
  const [adding, setAdding] = useState(false)
  const [newStep, setNewStep] = useState<Partial<Step>>({
    name: '',
    status: 'pending',
    est_duration_hours: null,
    required_qty: null,
  })

  async function saveJob(payload: any) {
    setSaving(true)
    setMsg(null)
    setErr(null)
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Kaydetme başarısız')
      setMsg('Kaydedildi')
      router.refresh()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const onSave = () =>
    saveJob({ title, description, status, customer_id: customerId ?? null })

  const onFreeze = () => saveJob({ status: 'frozen' })
  const onCancel = () => saveJob({ status: 'canceled' })
  const onReopen = () => saveJob({ status: 'open' })

  // ---- STEPS CRUD ----
  async function addStep() {
    if (!newStep.name?.trim()) {
      setErr('Adım adı gerekli')
      return
    }
    setAdding(true)
    setErr(null)
    try {
      const res = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: id,
          name: newStep.name,
          status: newStep.status ?? 'pending',
          est_duration_hours: newStep.est_duration_hours ?? null,
          required_qty: newStep.required_qty ?? null,
          template_id: newStep.template_id ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Adım eklenemedi')
      setSteps((s) => [...s, data])
      setNewStep({ name: '', status: 'pending', est_duration_hours: null, required_qty: null })
      router.refresh()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setAdding(false)
    }
  }

  async function updateStep(row: Step) {
    setErr(null)
    const res = await fetch(`/api/steps/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: row.name,
        status: row.status ?? 'pending',
        est_duration_hours: row.est_duration_hours ?? null,
        required_qty: row.required_qty ?? null,
        template_id: row.template_id ?? null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setErr(data?.error || 'Adım güncellenemedi')
      return
    }
    setMsg('Adım güncellendi')
    router.refresh()
  }

  async function deleteStep(idToDelete: number) {
    setErr(null)
    const res = await fetch(`/api/steps/${idToDelete}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErr(data?.error || 'Adım silinemedi')
      return
    }
    setSteps((s) => s.filter((x) => x.id !== idToDelete))
    setMsg('Adım silindi')
    router.refresh()
  }

  // helpers
  const customerOptions = customers?.map((c) => ({ value: c.id, label: c.name })) ?? []

  return (
    <div className="space-y-6">
      {/* Üst alanlar */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Başlık</div>
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Durum</div>
          <select
            className="w-full border rounded px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
            <option value="frozen">frozen</option>
            <option value="canceled">canceled</option>
          </select>
        </div>

        <div className="p-4 rounded-xl border md:col-span-2">
          <div className="text-sm text-gray-500 mb-1">Açıklama</div>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[90px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* İşlemler */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
        <button onClick={onFreeze} className="px-4 py-2 rounded bg-amber-500 text-white">Dondur</button>
        <button onClick={onCancel} className="px-4 py-2 rounded bg-rose-600 text-white">İptal Et</button>
        <button onClick={onReopen} className="px-4 py-2 rounded bg-gray-700 text-white">Tekrar Aç</button>
        {msg && <span className="text-green-700 text-sm">{msg}</span>}
        {err && <span className="text-red-600 text-sm">{err}</span>}
      </div>

      {/* Diğer bilgiler */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Müşteri</div>
          <div>
            {isAdmin ? (
              <select
                className="w-full border rounded px-3 py-2"
                value={customerId ?? ''}
                onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— seçiniz —</option>
                {customerOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <div className="font-medium">{initialCustomerName}</div>
            )}
          </div>
        </div>

        {isSuperadmin && (
          <div className="p-4 rounded-xl border">
            <div className="text-sm text-gray-500 mb-1">Tenant</div>
            <div className="font-medium">{tenantId ?? '—'}</div>
          </div>
        )}

        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Oluşturma</div>
          <div className="font-medium">
            {createdAt ? new Date(createdAt).toLocaleString() : '—'}
          </div>
        </div>
      </div>

      {/* Adımlar */}
      <div className="p-4 rounded-xl border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Adımlar</h2>
          <div className="text-sm text-gray-500">{steps.length} kayıt</div>
        </div>

        {/* Ekleme satırı */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <input
            className="border rounded px-2 py-1 col-span-2"
            placeholder="Adım adı"
            value={newStep.name ?? ''}
            onChange={(e) => setNewStep((s) => ({ ...s, name: e.target.value }))}
          />
          <select
            className="border rounded px-2 py-1"
            value={newStep.status ?? 'pending'}
            onChange={(e) => setNewStep((s) => ({ ...s, status: e.target.value }))}
          >
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
            <option value="frozen">frozen</option>
            <option value="canceled">canceled</option>
          </select>
          <input
            className="border rounded px-2 py-1"
            placeholder="Tah. saat"
            type="number"
            value={newStep.est_duration_hours ?? ''}
            onChange={(e) =>
              setNewStep((s) => ({ ...s, est_duration_hours: e.target.value ? Number(e.target.value) : null }))
            }
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Gereksinim"
            type="number"
            value={newStep.required_qty ?? ''}
            onChange={(e) =>
              setNewStep((s) => ({ ...s, required_qty: e.target.value ? Number(e.target.value) : null }))
            }
          />
        </div>
        <button
          onClick={addStep}
          disabled={adding}
          className="mb-4 px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          {adding ? 'Ekleniyor…' : 'Adım Ekle'}
        </button>

        {/* Liste */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Ad</th>
                <th className="py-2 pr-4">Durum</th>
                <th className="py-2 pr-4">Tah. Süre (saat)</th>
                <th className="py-2 pr-4">Gereksinim</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, idx) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{idx + 1}</td>
                  <td className="py-2 pr-4">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={s.name}
                      onChange={(e) =>
                        setSteps((arr) =>
                          arr.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x))
                        )
                      }
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <select
                      className="border rounded px-2 py-1"
                      value={s.status ?? 'pending'}
                      onChange={(e) =>
                        setSteps((arr) =>
                          arr.map((x) => (x.id === s.id ? { ...x, status: e.target.value } : x))
                        )
                      }
                    >
                      <option value="pending">pending</option>
                      <option value="in_progress">in_progress</option>
                      <option value="completed">completed</option>
                      <option value="frozen">frozen</option>
                      <option value="canceled">canceled</option>
                    </select>
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={s.est_duration_hours ?? ''}
                      onChange={(e) =>
                        setSteps((arr) =>
                          arr.map((x) =>
                            x.id === s.id
                              ? { ...x, est_duration_hours: e.target.value ? Number(e.target.value) : null }
                              : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={s.required_qty ?? ''}
                      onChange={(e) =>
                        setSteps((arr) =>
                          arr.map((x) =>
                            x.id === s.id
                              ? { ...x, required_qty: e.target.value ? Number(e.target.value) : null }
                              : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <button
                      className="px-3 py-1 rounded bg-blue-600 text-white mr-2"
                      onClick={() => updateStep(s)}
                    >
                      Güncelle
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-rose-600 text-white"
                      onClick={() => deleteStep(s.id)}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {steps.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-gray-500">Adım yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
