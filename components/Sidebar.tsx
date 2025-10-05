'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const NavItem = ({ href, children }: any) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} className={`block rounded-md px-3 py-2 text-sm ${active ? 'bg-primary text-white' : 'text-gray-700 hover:bg-primary-light'}`}>
      {children}
    </Link>
  );
};

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{
      const r = (data.session?.user?.app_metadata as any)?.role || null;
      setRole(r);
    });
  }, []);

  return (
    <aside className="w-56 bg-white border-r border-gray-200 p-4">
      <div className="mb-4 text-lg font-semibold text-primary">Firma Paneli</div>
      <nav className="space-y-1">
        <NavItem href="/">Dashboard</NavItem>
        {role && <NavItem href="/jobs/new">Yeni İş Talebi</NavItem>}
        {(role === 'admin' || role === 'manager') && <NavItem href="/processes">Süreç Ayarları</NavItem>}
        <NavItem href="/jobs/1">Görev Detay (Ör.)</NavItem>
        <NavItem href="/board">Kanban</NavItem>
        <NavItem href="/processes">Süreçler</NavItem>
        <NavItem href="/jobs/new">İş Oluştur</NavItem>
        <NavItem href="/files">Dosyalar</NavItem>
        <NavItem href="/customers">Müşteriler</NavItem>

        <NavItem href="/logs">Log Geçmişi</NavItem>
        <NavItem href="/admin/users">Kullanıcı Yönetimi</NavItem>
        <NavItem href="/login">Giriş</NavItem>
              <NavItem href="/calendar">Takvim</NavItem>
              <NavItem href="/settings/notifications">Bildirimler</NavItem>
              <NavItem href="/admin/permissions">Yetkiler</NavItem>
      </nav>
    </aside>
  );
}
