// src/app/jobs/[id]/page.tsx
'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

type Step = {
  id: number
  name: string
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'canceled' | string
  assigned_user: string | null
  production_qty?: number
  note?: string | null
}

type User = { id: string; username: string }

function AssignUserCell({
  stepId,
  initial,
  onSaved,
}: {
  stepId: number
  initial?: string | null
  onSaved?: () => void
}) {
  const [users, setUsers] = useState<User[]>([])
  const [val, setVal] = useState(initial ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/tenant/users', { cache: 'no-store' })
        const d = await r.json().catch(() => [])
        setUsers(Array.isArray(d) ? d : [])
      } catch {
        setUsers([])
      }
    })()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_user: val || null, action: 'assign' }),
      })
      if (!res.ok) throw new Error(await res.text())
      onSaved?.()
    } catch (e: any) {
      alert('Atama kaydedilemedi: ' + (e?.message || ''))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="select select-sm select-bordered"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
      >
        <option value="">(atanmadı)</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>
      {saving && <span className="loading loading-spinner loading-xs" />}
    </div>
  )
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const jobId = Number(params.id)

  // --------- İş Bilgisi (okunur) – istersen burayı kendi API’na bağlayabilirsin ----------
  const [jobInfo, setJobInfo] = useState<{ title?: string; description?: string; status?: string; customer?: string; created_at?: string } | null>(null)
  useEffect(() => {
    // Burada kendi job endpoint’in varsa ona bağla. Yoksa boş bırakıyoruz.
    // Örnek (uyarlayabilirsin):
    // fetch(`/api/jobs/${jobId}`).then(r=>r.json()).then(setJobInfo).catch(()=>setJobInfo(null))
    setJobInfo((j) => j ?? null)
  }, [jobId])

  // --------- Adımlar (yalnızca sorumlu atama) ----------
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(false)

  const loadSteps = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/jobs/${jobId}/steps`, { cache: 'no-store' })
      const d = await r.json()
      if (Array.isArray(d)) {
        // API farklı alan adları döndürebilir; normalize et
        const norm = d.map((x: any) => ({
          id: Number(x.id),
          name: x.name ?? x.step_name ?? 'Adım',
          status: (x.status ?? 'not_started') as Step['status'],
          assigned_user: x.assigned_user ?? x.user_id ?? null,
          production_qty: x.production_qty ?? 0,
          note: x.note ?? null,
        }))
        setSteps(norm)
      } else {
        setSteps([])
      }
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    loadSteps()
  }, [loadSteps])

  const statusPretty = useMemo(
    () => (s: string) =>
      ({ not_started: 'Başlamadı', in_progress: 'Devam', paused: 'Durduruldu', completed: 'Bitti', canceled: 'İptal' } as any)[s] ?? s,
    []
  )

  return (
    <div className="p-4 space-y-6">
      {/* Başlık + Görev ekranı butonu */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">İş Detayı</h1>
        <Link href={`/jobs/${jobId}/tasks`} className="btn btn-sm">
          Görev ekranını aç
        </Link>
      </div>

      {/* İş bilgisi – sade, okunur; kendi alanlarınla doldur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="form-control">
          <span className="label-text">Başlık</span>
          <input className="input input-bordered" defaultValue={jobInfo?.title ?? ''} readOnly />
        </label>
        <label className="form-control">
          <span className="label-text">Durum</span>
          <input className="input input-bordered" defaultValue={jobInfo?.status ?? ''} readOnly />
        </label>
        <label className="form-control md:col-span-2">
          <span className="label-text">Açıklama</span>
          <textarea className="textarea textarea-bordered h-24" defaultValue={jobInfo?.description ?? ''} readOnly />
        </label>
        <label className="form-control">
          <span className="label-text">Müşteri</span>
          <input className="input input-bordered" defaultValue={jobInfo?.customer ?? ''} readOnly />
        </label>
        <label className="form-control">
          <span className="label-text">Oluşturma</span>
          <input className="input input-bordered" defaultValue={jobInfo?.created_at ?? ''} readOnly />
        </label>
      </div>

      {/* Adımlar – sadece Sorumlu ataması */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Adımlar</h2>
          <button className="btn btn-sm" onClick={loadSteps} disabled={loading}>
            {loading ? 'Yükleniyor…' : 'Yenile'}
          </button>
          <span className="text-xs text-gray-500">{steps.length} adım</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ad</th>
                <th>Durum</th>
                <th>Sorumlu</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => (
                <tr key={s.id}>
                  <td className="whitespace-nowrap">{s.id}</td>
                  <td className="whitespace-nowrap">{s.name}</td>
                  <td className="whitespace-nowrap">{statusPretty(s.status)}</td>
                  <td>
                    <AssignUserCell stepId={s.id} initial={s.assigned_user} onSaved={loadSteps} />
                  </td>
                </tr>
              ))}
              {steps.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-sm text-gray-500">
                    Bu işe bağlı adım bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
