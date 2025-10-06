'use client'
import { useEffect, useState } from 'react'

type Step = {
  id: number
  name: string
  status: 'not_started'|'in_progress'|'paused'|'completed'|'canceled'
  production_qty: number
  assigned_user: string | null
  note?: string | null
  pause_reason?: string | null
}
type User = { id: string; username: string }

export default function StepRow({ step, reload }: { step: Step; reload: () => void }) {
  const [users, setUsers] = useState<User[]>([])
  const [assignee, setAssignee] = useState(step.assigned_user ?? '')
  const [qty, setQty] = useState<number>(0)
  const [note, setNote] = useState(step.note ?? '')
  const [pauseReason, setPauseReason] = useState('')

  useEffect(() => {
    fetch('/api/tenant/users').then(r => r.json()).then(setUsers).catch(()=>{})
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
      <td className="whitespace-nowrap capitalize">{step.status.replace('_',' ')}</td>

      <td>
        <select
          className="select select-bordered select-sm"
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
          onBlur={() => patch({ assigned_user: assignee || null, action: 'assign' })}
        >
          <option value="">(atanmadı)</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
      </td>

      <td className="w-36">
        <div className="flex gap-2">
          <input
            type="number"
            className="input input-sm input-bordered w-20"
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
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
          onChange={e => setNote(e.target.value)}
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
              onChange={e => setPauseReason(e.target.value)}
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
