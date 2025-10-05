
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const router = useRouter();

  useEffect(()=>{
    supabase.auth.onAuthStateChange((_event, session)=>{
      if (session?.access_token) {
        setToken(session.access_token);
        router.push('/');
      }
    })
  }, [router]);

  const submit = async () => {
    setError(null);
    try {
      if (mode === 'signin') {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (e:any) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-md card p-6">
      <h2 className="text-xl font-semibold mb-4">{mode === 'signin' ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
      <label className="label">E-posta</label>
      <input className="input mb-3" value={email} onChange={e=>setEmail(e.target.value)} />
      <label className="label">Şifre</label>
      <input type="password" className="input mb-4" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <div className="flex items-center gap-2 mb-3">
        <button className="btn flex-1" onClick={submit}>{mode === 'signin' ? 'Giriş' : 'Kayıt'}</button>
        <button className="text-sm link" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>
          {mode === 'signin' ? 'Hesabın yok mu? Kayıt ol' : 'Giriş sayfasına dön'}
        </button>
      </div>
    </div>
  )
}
