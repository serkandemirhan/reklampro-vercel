'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Zaten giriş yapmışsa ana sayfaya
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/');
    });
    // Oturum değiştiğinde yönlendir
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push('/');
    });
    return () => sub.subscription?.unsubscribe();
  }, [router]);

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    // setToken ÇAĞRISI YOK — Supabase session cookie ile çalışıyor
    router.push('/');
  };

  return (
    <div className="max-w-sm mx-auto card p-6 space-y-4">
      <div className="text-lg font-medium">Giriş</div>
      <input className="input w-full" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="input w-full" type="password" placeholder="Parola" value={pass} onChange={e => setPass(e.target.value)} />
      <button className="btn w-full" onClick={login} disabled={loading}>
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>
    </div>
  );
}
