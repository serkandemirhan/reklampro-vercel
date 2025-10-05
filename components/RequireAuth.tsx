'use client';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{
      if (!data.session) router.push('/login'); else setReady(true);
    });
  }, [router]);

  if (!ready) return <div className="text-sm text-gray-500">Yükleniyor...</div>;
  return <>{children}</>;
}
