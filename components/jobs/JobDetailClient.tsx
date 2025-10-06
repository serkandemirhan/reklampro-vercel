// components/jobs/JobDetailClient.tsx
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = {
  id: number
  job_id: number
  template_id: number | null
  name: string
  status?: string | null
  est_duration_hours?: number | null
  required_qty?: number | null
}

type Customer = { id: number; name: string }
type Template = { id: number; name: string }

const STATUS_OPTIONS = [
  { value: 'open', label: 'Yeni' },
  { value: 'in_progress', label: 'Devam Ediyor' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'frozen', label: 'Donduruldu' },
  { value: 'canceled', label: 'İptal' },
]

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
  templates: Template[]
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
    templates,
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

  // --- TÜRKÇE DURUM SEÇİMİ ---
  const statusValue = status
  const statusLabel = STATUS_OPTIONS.find(o => o.value === statusValue)?.label ?? statusValue

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

  const onSave = () => saveJob({ title, description, status, customer_id: customerId ?? null })
  const onFreeze = () => saveJob({ status: 'frozen' })
  const onCancel = () => saveJob({ status: 'canceled' })
  const onReopen = () => saveJob({ status: 'open' })

  // --- Templates ile ACTIVE/PASSIVE ---
  const activeTemplateIds = useMemo(
    () => new Set(steps.map(s => s.template_id).filter(Boolean) as number[]),
    [steps]
  )

  const inactiveTemplates = useMemo(
    () => templates.filter(t => !activeTemplateIds.has(t.id)),
    [templates, activeTemplateIds]
  )

  async function activateTemplate(t: Template) {
    setErr(null)
    const res = await fetch('/api/steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: id,
        template_id: t.id,
        // isim backend’de de template’ten dolduruluyor, ama yine de gönderelim
        name: t.name,
        status: 'pending',
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setErr(data?.error || 'Aktifleştirme başarısız')
      return
    }
    setSteps(s => [...s, data])
    setMsg(`'${t.name}' aktifleştirildi`)
    router.refresh()
  }

  async function deactivateStep(stepId: number) {
    setErr(null)
    const res = await fetch(`/api/steps/${stepId}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErr(data?.error || 'Pasifleştirme başarısız')
      return
    }
    setSteps(s => s.filter(x => x.id !== stepId))
    setMsg('Adım pasifleştirildi')
    router.refresh()
  }

  async function updateStep(row: Step) {
    setErr(null)
    const res = await fetch(`/api/steps/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // name’ı düzenlettirmiyoruz; şablondan gelir
        status: row.status ?? 'pending',
        est_duration_hours: row.est_duration_hours ?? null,
        required_qty: row.required_qty ?? null,
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

  // Görünümde isim kaynağı: instance.name || template.name
  function displayName(s: Step) {
    if (s?.name) return s.name
    const tpl = templates.find(t => t.id === s.template_id)
    return tpl?.name || 'Adım'
  }

  return (
    <div className="space-y-6">
      {/* Üst alanlar */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Başlık</div>
          <input className="w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500 mb-1">Durum</div>
          <select
            className="w-full border rounded px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="p-4 rounded-xl border md:col-span-2">
          <div className="text-sm text-gray-500 mb-1">Açıklama</div>
          <textarea className="w-full border rounded px-3 py-2 min-h-[90px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      {/* İşlemler */}
      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
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
          {isAdmin ? (
            <select
              className="w-full border rounded px-3 py-2"
              value={customerId ?? ''}
              onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— seçiniz —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <div className="font-medium">{initialCustomerName}</div>
          )}
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
      <div className="p-4 rounded-xl border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Adımlar</h2>
          <div className="text-sm text-gray-500">{steps.length} aktif</div>
        </div>

        {/* ŞABLONLAR: pasif olanları aktifleştir */}
        {inactiveTemplates.length > 0 && (
          <div className="p-3 rounded bg-gray-50 border">
            <div className="text-sm text-gray-600 mb-2">Pasif Şablonlar</div>
            <div className="flex flex-wrap gap-2">
              {inactiveTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => activateTemplate(t)}
                  className="px-3 py-1 rounded bg-green-600 text-white"
                  title="Bu şablonu aktifleştir (adım oluştur)"
                >
                  {t.name} ➜ Aktif Et
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AKTİF ADIMLAR: isim düzenlenmez; status/süre/gereksinim düzenlenir */}
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
                  <td className="py-2 pr-4">{displayName(s)}</td>
                  <td className="py-2 pr-4">
                    <select
                      className="border rounded px-2 py-1"
                      value={s.status ?? 'pending'}
                      onChange={(e) =>
                        setSteps(arr => arr.map(x => x.id === s.id ? { ...x, status: e.target.value } : x))
                      }
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={s.est_duration_hours ?? ''}
                      onChange={(e) =>
                        setSteps(arr => arr.map(x =>
                          x.id === s.id ? { ...x, est_duration_hours: e.target.value ? Number(e.target.value) : null } : x
                        ))
                      }
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={s.required_qty ?? ''}
                      onChange={(e) =>
                        setSteps(arr => arr.map(x =>
                          x.id === s.id ? { ...x, required_qty: e.target.value ? Number(e.target.value) : null } : x
                        ))
                      }
                    />
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <button className="px-3 py-1 rounded bg-blue-600 text-white mr-2" onClick={() => updateStep(s)}>
                      Güncelle
                    </button>
                    <button className="px-3 py-1 rounded bg-rose-600 text-white" onClick={() => deactivateStep(s.id)}>
                      Pasifleştir
                    </button>
                  </td>
                </tr>
              ))}
              {steps.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-gray-500">Aktif adım yok. Yukarıdan şablon seçip aktifleştirebilirsin.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
