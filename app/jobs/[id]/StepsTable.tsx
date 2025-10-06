'use client'
import { useCallback, useEffect, useState } from 'react'
import StepRow from './StepRow'

export default function StepsTable({ jobId }: { jobId: number }) {
  const [steps, setSteps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/steps`)
      const data = await res.json()
      setSteps(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => { load() }, [load])

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <button className="btn btn-sm" onClick={load} disabled={loading}>{loading ? 'Yükleniyor...' : 'Yenile'}</button>
        <div className="text-xs text-gray-500">{steps.length} adım</div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ad</th>
              <th>Durum</th>
              <th>Sorumlu</th>
              <th>Üretim</th>
              <th>Not</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s: any) => (
              <StepRow
                key={s.id}
                step={{
                  id: s.id,
                  name: s.name ?? s.step_name ?? '(Adım)',
                  status: s.status,
                  production_qty: s.production_qty ?? 0,
                  assigned_user: s.assigned_user ?? null,
                  note: s.note ?? '',
                  pause_reason: s.pause_reason ?? ''
                }}
                reload={load}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
