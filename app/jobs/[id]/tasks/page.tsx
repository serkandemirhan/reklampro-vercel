'use client'
import { useCallback, useEffect, useState } from 'react'

// satır bileşeni (bu dosyada inline)
function StepRow({ step, reload }: { step: any; reload: () => void }) {
  const [users, setUsers] = useState<any[]>([])
  const [assignee, setAssignee] = useState(step.assigned_user ?? '')
  const [qty, setQty] = useState<number>(0)
  const [note, setNote] = useState(step.note ?? '')
  const [pauseReason, setPauseReason] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/tenant/users')
        const d = await r.json().catch(() => [])
        setUsers(Array.isArray(d) ? d : [])
      } catch { setUsers([]) }
    })()
  }, [])

  const patch = async (body: any) => {
    const res = await fetch(`/api/steps/${step.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) { alert('Hata: ' + (await res.text())); return }
    reload()
  }

  return (
    <tr>
      <td className="whitespace-nowrap">{step.id}</td>
      <td className="whitespace-nowrap">{step.name}</td>
      <td className="whitespace-nowrap capitalize">{(step.status ?? 'not_started').replace('_',' ')}</td>

      <td>
        <select
          className="select select-bordered select-sm"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          onBlur={() => patch({ assigned_user: assignee || null, action: 'assign' })}
        >
          <option value="">(atanmadı)</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
      </td>

      <td className="w-36">
        <div className="flex gap-2">
          <input
            type="number"
            className="input input-sm input-bordered w-20"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            placeholder="+miktar"
          />
          <button className="btn btn-sm" onClick={() => patch({ qty_delta: qty || 0 })}>Ekle</button>
        </div>
        <div className="text-xs text-gray-500 mt-1">Toplam: {step.production_qty ?? 0}</div>
      </td>

      <td className="w-64">
        <textarea
          className="textarea textarea-bordered textarea-sm w-full"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => patch({ note })}
          placeholder="Not..."
        />
      </td>

      <td className="w-72">
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-xs" onClick={() => patch({ action: 'start' })}>Başlat</button>
          <div className="flex items-center gap-1">
            <button className="btn btn-xs btn-warning" onClick={() => patch({ action: 'pause', pause_reason: pauseReason })}>Durdur</button>
            <input
              className="input input-xs input-bordered w-28"
              placeholder="Sebep"
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
            />
          </div>
          <button className="btn btn-xs" onClick={() => patch({ action: 'resume' })}>Devam</button>
          <button className="btn btn-xs btn-success" onClick={() => patch({ action: 'complete' })}>Bitir</button>
          <button className="btn btn-xs btn-error" onClick={() => patch({ action: 'cancel' })}>İptal</button>
        </div>
      </td>
    </tr>
  )
}

export default function Page({ params }: { params: { id: string } }) {
  const jobId = Number(params.id)
  const [steps, setSteps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/jobs/${jobId}/steps`)
      const d = await r.json()
      setSteps(Array.isArray(d) ? d : [])
    } finally { setLoading(false) }
  }, [jobId])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <a className="btn btn-sm" href={`/jobs/${jobId}`}>← İş Detayı</a>
        <button className="btn btn-sm" onClick={load} disabled={loading}>
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
        <div className="text-xs text-gray-500">{steps.length} adım</div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>Ad</th><th>Durum</th>
              <th>Sorumlu</th><th>Üretim</th><th>Not</th><th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <StepRow key={s.id} step={s} reload={load} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
