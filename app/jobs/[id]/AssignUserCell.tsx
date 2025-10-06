'use client'
import { useEffect, useState } from 'react'

type User = { id: string; username: string }

export default function AssignUserCell({
  stepId,
  value,
  onSaved,
}: {
  stepId: number
  value?: string | null
  onSaved?: () => void
}) {
  const [users, setUsers] = useState<User[]>([])
  const [assignee, setAssignee] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/tenant/users')
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
        body: JSON.stringify({ assigned_user: assignee || null, action: 'assign' }),
      })
      if (!res.ok) throw new Error(await res.text())
      onSaved?.()
    } catch (e) {
      alert('Atama kaydedilemedi: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="select select-sm select-bordered"
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        onBlur={save}
      >
        <option value="">(atanmadı)</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.username}</option>
        ))}
      </select>
      {saving && <span className="loading loading-spinner loading-xs" />}
    </div>
  )
}
