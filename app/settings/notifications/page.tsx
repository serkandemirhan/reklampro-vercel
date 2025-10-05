
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

export default function Page(){
  const [prefs, setPrefs] = useState<any>({ email_on_assign:true, email_on_status:true, email_on_comment:true });
  const load = async()=> setPrefs(await api('/notifications/me'));
  useEffect(()=>{ load(); }, []);
  const save = async()=>{
    await api('/notifications/me', { method:'POST', body: JSON.stringify(prefs) });
    alert('Kaydedildi');
  };
  return (
    <RequireAuth>
      <div className="card p-4 space-y-3">
        <div className="font-medium mb-2">Bildirim Tercihleri</div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!prefs.email_on_assign} onChange={e=>setPrefs({...prefs, email_on_assign:e.target.checked})} /> Görev atanınca e-posta</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!prefs.email_on_status} onChange={e=>setPrefs({...prefs, email_on_status:e.target.checked})} /> Durum değişince e-posta</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!prefs.email_on_comment} onChange={e=>setPrefs({...prefs, email_on_comment:e.target.checked})} /> Yoruma e-posta</label>
        <button className="btn" onClick={save}>Kaydet</button>
      </div>
    </RequireAuth>
  );
}
