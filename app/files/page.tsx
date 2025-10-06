// app/files/page.tsx
'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import RequireAuth from '@/components/RequireAuth'
import { api } from '@/lib/api'

type FileRow = { name:string; key:string; url:string; size:number; updated_at?:string; folder:string }

function Inner() {
  const [files, setFiles] = useState<FileRow[]>([])
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState('')    // yükleme hedefi
  const [subfolder, setSubfolder] = useState('')  // opsiyonel alt klasör

  const load = async () => {
    setLoading(true)
    try {
      const data = await api<FileRow[]>('/api/files/tenant-tree')
      setFiles(data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const grouped = useMemo(() => {
    const map: Record<string, FileRow[]> = {}
    for (const f of files) {
      const key = f.folder || '(Kök)'
      if (!map[key]) map[key] = []
      map[key].push(f)
    }
    // klasör adlarına göre alfabetik sırala
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b))
  }, [files])

  // drag&drop
  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const list = e.dataTransfer.files
    if (!list?.length) return
    for (const file of Array.from(list)) {
      await uploadOne(file)
    }
    await load()
  }, [customer, subfolder])

  const uploadOne = async (file: File) => {
    if (!customer.trim()) { alert('Lütfen müşteri adını yaz'); return }
    // 1) signed upload url al
    const { upload_url } = await api<{ upload_url:string; key:string; url:string }>(
      '/api/files/upload-init',
      {
        method: 'POST',
        body: JSON.stringify({
          customer_name: customer.trim(),
          subfolder: subfolder.trim() || undefined,
          filename: file.name
        })
      }
    )
    // 2) PUT ile binary yükle
    const res = await fetch(upload_url, { method: 'PUT', body: file })
    if (!res.ok) {
      const t = await res.text().catch(()=> '')
      throw new Error('Yükleme hatası: ' + (t || res.statusText))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500">Müşteri adı</label>
          <input value={customer} onChange={e=>setCustomer(e.target.value)} className="input input-bordered" placeholder="Örn: Tenant müşterisi ismi" />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Alt klasör (opsiyonel)</label>
          <input value={subfolder} onChange={e=>setSubfolder(e.target.value)} className="input input-bordered" placeholder="Örn: teklifler, üretim..." />
        </div>
        <div className="text-sm text-gray-500">Sürükle-bırak alanına dosya atabilirsin ↓</div>
      </div>

      <div
        onDragOver={(e)=>e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed rounded p-6 text-center"
      >
        <div className="font-medium">Sürükle-bırak yükleme alanı</div>
        <div className="text-xs text-gray-500">Bir veya birden fazla dosyayı buraya bırak</div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-sm" onClick={load} disabled={loading}>{loading ? 'Yükleniyor...' : 'Yenile'}</button>
        <div className="text-xs text-gray-500">{files.length} dosya</div>
      </div>

      {/* Tüm klasörleri tek sayfada göster */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {grouped.map(([folder, rows]) => (
          <div key={folder} className="border rounded p-3">
            <div className="font-semibold mb-2">{folder}</div>
            <ul className="text-sm space-y-1">
              {rows.sort((a,b)=>a.name.localeCompare(b.name)).map(f => (
                <li key={f.key} className="flex items-center justify-between gap-3">
                  <span className="truncate">{f.name}</span>
                  <a className="link" href={f.url} target="_blank" rel="noreferrer">Aç</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Page(){ return <RequireAuth><Inner/></RequireAuth> }
