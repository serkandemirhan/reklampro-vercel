// app/files/page.tsx
'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import RequireAuth from '@/components/RequireAuth'
import { api } from '@/lib/api' // basit fetch wrapper'ınız; yoksa fetch kullanın

type FileRow = { name: string; key: string; url: string; size: number; updated_at?: string; folder: string }

function Inner() {
  const [files, setFiles] = useState<FileRow[]>([])
  const [loading, setLoading] = useState(false)

  // upload hedefleri
  const [customer, setCustomer] = useState('')
  const [subfolder, setSubfolder] = useState('')

  // drag & drop state
  const [dragActive, setDragActive] = useState(false)
  const prevent = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }
  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { prevent(e); setDragActive(true) }
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { prevent(e); setDragActive(false) }
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { prevent(e); if (!dragActive) setDragActive(true) }
  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    prevent(e); setDragActive(false)
    const list = e.dataTransfer?.files
    if (!list?.length) return
    for (const f of Array.from(list)) await uploadOne(f)
    await load()
  }

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
      const k = f.folder || '(Kök)'
      if (!map[k]) map[k] = []
      map[k].push(f)
    }
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b))
  }, [files])

  const uploadOne = async (file: File) => {
    const targetCustomer = customer.trim() || 'GENEL'
    // 1) signed upload init
    const { upload_url } = await api<{ upload_url: string; key: string }>(
      '/api/files/upload-init',
      {
        method: 'POST',
        body: JSON.stringify({
          customer_name: targetCustomer,
          subfolder: subfolder.trim() || undefined,
          filename: file.name
        })
      }
    )
    // 2) PUT binary
    const res = await fetch(upload_url, { method: 'PUT', body: file })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error('Yükleme hatası: ' + (t || res.statusText))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500">Müşteri adı</label>
          <input
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            className="input input-bordered"
            placeholder="Örn: Tenant müşterisi ismi (boşsa: GENEL)"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Alt klasör (opsiyonel)</label>
          <input
            value={subfolder}
            onChange={e => setSubfolder(e.target.value)}
            className="input input-bordered"
            placeholder="Örn: teklif, üretim..."
          />
        </div>
        <div className="text-sm text-gray-500">Sürükle-bırak alanına dosya atabilirsin ↓</div>
      </div>

      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded p-6 text-center transition
          ${dragActive ? 'bg-teal-50 border-teal-400' : 'border-gray-300'}`}
      >
        <div className="font-medium">Sürükle-bırak yükleme alanı</div>
        <div className="text-xs text-gray-500">Bir veya birden fazla dosyayı buraya bırak</div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-sm" onClick={load} disabled={loading}>
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
        <div className="text-xs text-gray-500">{files.length} dosya</div>
      </div>

      {/* Klasör grupları tek sayfada */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {grouped.map(([folder, rows]) => (
          <div key={folder} className="border rounded p-3">
            <div className="font-semibold mb-2">{folder}</div>
            <ul className="text-sm space-y-1">
              {rows.sort((a, b) => a.name.localeCompare(b.name)).map(f => (
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

export default function Page() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  )
}
