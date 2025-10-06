'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Job = {
  id:number; job_no:string; title:string; description:string|null;
  status:'open'|'in_progress'|'paused'|'closed'|'canceled'|string;
  customer_id:number|null; created_at:string; customer_name?:string|null
}

type SessionUser = { id:string, role?:string }

export default function JobDetail({ params }: { params:{ id:string }}) {
  const id = Number(params.id)
  const [job, setJob] = useState<Job|null>(null)
  const [user, setUser] = useState<SessionUser|null>(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', status:'open' })

  const load = async () => {
    // job
    const res = await fetch(`/api/jobs/${id}`)
    if (res.ok) {
      const j: Job = await res.json()
      setJob(j)
      setForm({
        title: j.title ?? '',
        description: j.description ?? '',
        status: j.status as any
      })
    }
    // me
    const me = await fetch('/api/me').catch(()=>null) // varsa
    if (me?.ok) {
      const data = await me.json()
      setUser({ id: data.id, role: data.app_metadata?.role })
    }
  }

  useEffect(()=>{ load() }, [])

  const canEdit = ['admin','manager'].includes(String(user?.role))

  const save = async () => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(form)
    })
    if (!res.ok) {
      const e = await res.json().catch(()=>({}))
      alert(e.error || 'Kaydetme başarısız')
      return
    }
    setEdit(false)
    await load()
  }

  const setStatus = async (status:'paused'|'canceled'|'in_progress'|'closed') => {
    const res = await fetch(`/api/jobs/${id}`, {
      method:'PATCH',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ status })
    })
    if (!res.ok) {
      const e = await res.json().catch(()=>({}))
      alert(e.error || 'Durum değiştirilemedi')
      return
    }
    await load()
  }

  if (!job) return <div className="p-4">Yükleniyor...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">İş Talebi #{job.job_no}</h2>
        <div className="flex gap-2">
          <Link className="btn" href="/jobs">Tüm Talepler</Link>
          {canEdit && (
            <button className="btn" onClick={()=>setEdit(e=>!e)}>{edit ? 'Vazgeç' : 'Düzenle'}</button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Müşteri</div>
          <div className="font-medium">{job.customer_name ?? '-'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Durum</div>
          <div className="font-medium">{job.status}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Oluşturulma</div>
          <div>{new Date(job.created_at).toLocaleString('tr-TR')}</div>
        </div>
      </div>

      <div className="card p-4">
        {!edit ? (
          <>
            <div className="mb-2"><span className="text-xs text-gray-500">Başlık</span><div className="font-medium">{job.title}</div></div>
            <div><span className="text-xs text-gray-500">Açıklama</span><div>{job.description ?? '-'}</div></div>
          </>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <div className="label">Başlık</div>
              <input className="input w-full" value={form.title} onChange={e=>setForm(f=>({ ...f, title:e.target.value }))}/>
            </div>
            <div className="md:col-span-1">
              <div className="label">Durum</div>
              <select className="input w-full" value={form.status} onChange={e=>setForm(f=>({ ...f, status:e.target.value }))}>
                <option value="open">Yeni</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="paused">Dondurulmuş</option>
                <option value="closed">Kapatılmış</option>
                <option value="canceled">İptal</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <div className="label">Açıklama</div>
              <textarea className="input w-full" rows={4}
                value={form.description} onChange={e=>setForm(f=>({ ...f, description:e.target.value }))}/>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button className="btn" onClick={save}>Kaydet</button>
            </div>
          </div>
        )}
      </div>

      {canEdit && !edit && (
        <div className="card p-4 flex flex-wrap gap-2">
          <button className="btn" onClick={()=>setStatus('in_progress')}>Devam Ettir</button>
          <button className="btn" onClick={()=>setStatus('paused')}>Dondur</button>
          <button className="btn" onClick={()=>setStatus('closed')}>Kapat</button>
          <button className="btn" onClick={()=>setStatus('canceled')}>İptal Et</button>
        </div>
      )}
    </div>
  )
}
