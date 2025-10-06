// components/jobs/JobDetailClient.tsx
'use client'

import { useState } from 'react'

type Props = {
  id: number
  initialTitle: string
  initialDescription: string
  initialStatus: string
  isAdmin: boolean
}

export default function JobDetailClient({
  id,
  initialTitle,
  initialDescription,
  initialStatus,
  isAdmin,
}: Props) {
  const [title, setTitle] = useState(initialTitle || '')
  const [description, setDescription] = useState(initialDescription || '')
  const [status, setStatus] = useState(initialStatus || 'open')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function save(payload: any) {
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
      if (!res.ok) throw new Error(data?.error || 'Kaydetme başarısız oldu')
      setMsg('Kaydedildi')
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const onSave = () => save({ title, description, status })
  const onFreeze = () => save({ status: 'frozen' })
  const onCancel = () => save({ status: 'canceled' })
  const onReopen = () => save({ status: 'open' })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="p-4 rounded-xl border">
        <div className="text-sm text-gray-500 mb-1">Başlık</div>
        {isAdmin ? (
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <div className="font-medium">{title || '—'}</div>
        )}
      </div>

      <div className="p-4 rounded-xl border">
        <div className="text-sm text-gray-500 mb-1">Durum</div>
        {isAdmin ? (
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
        ) : (
          <div className="font-medium">{status ?? '—'}</div>
        )}
      </div>

      <div className="p-4 rounded-xl border md:col-span-2">
        <div className="text-sm text-gray-500 mb-1">Açıklama</div>
        {isAdmin ? (
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[90px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        ) : (
          <div className="whitespace-pre-wrap">{description || '—'}</div>
        )}
      </div>

      {isAdmin && (
        <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>

          <button
            onClick={onFreeze}
            disabled={saving}
            className="px-4 py-2 rounded bg-amber-500 text-white disabled:opacity-50"
            title="İşi dondur ve tüm adımları frozen yap"
          >
            Dondur
          </button>

          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded bg-rose-600 text-white disabled:opacity-50"
            title="İşi iptal et ve tüm adımları canceled yap"
          >
            İptal Et
          </button>

          <button
            onClick={onReopen}
            disabled={saving}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
            title="İşi open durumuna al"
          >
            Tekrar Aç
          </button>

          {msg && <span className="text-green-700 text-sm">{msg}</span>}
          {err && <span className="text-red-600 text-sm">{err}</span>}
        </div>
      )}
    </div>
  )
}
