'use client';
import React, { useCallback, useState } from 'react';
import { API_BASE, api } from '@/lib/api';

type Props = { jobId:number; stepId?:number };

export default function Dropzone({ jobId, stepId }: Props) {
  const [info, setInfo] = useState<string>('Dosyaları buraya sürükleyin veya tıklayın (çoklu desteklenir)');

  const uploadOne = async (file: File) => {
    // Prefer S3 presigned
    const init = await api('/files/upload-init', {
      method:'POST',
      body: JSON.stringify({ job_id: jobId, step_id: stepId, filename: file.name })
    });
    let key = init.key as string;
    if (init.upload_url) {
      await fetch(init.upload_url, { method:'PUT', body:file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });
    } else {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch(`${API_BASE}/files/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const r = await res.json(); key = r.key;
    }
    await api('/files/register?job_id='+jobId+'&step_id='+(stepId||'')+'&key='+encodeURIComponent(key)+'&original_name='+encodeURIComponent(file.name), { method:'POST' });
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length===0) return;
    setInfo('Yükleniyor...');
    try {
      for (let i=0;i<files.length;i++) await uploadOne(files[i]);
      setInfo('Yüklendi ✔️');
    } catch (e:any) {
      setInfo('Hata: ' + e.message);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  },[]);

  return (
    <div
      className="border-2 border-dashed rounded-lg p-6 text-center bg-primary-light cursor-pointer"
      onDragOver={e=>e.preventDefault()}
      onDrop={onDrop}
      onClick={()=>document.getElementById('file-input')?.click()}
    >
      <input id="file-input" type="file" className="hidden" multiple onChange={e=>onFiles(e.target.files)} />
      <div className="text-sm">{info}</div>
    </div>
  );
}
