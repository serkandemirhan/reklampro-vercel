'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // sende nasıl ise onu koru

type Role = 'admin' | 'manager' | 'user' | null;

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={
        'block rounded-md px-3 py-2 text-sm ' +
        (active ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-50')
      }
    >
      {children}
    </Link>
  );
}

export default function Sidebar() {
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const r = (data.session?.user?.app_metadata as any)?.role || null;
      setRole(r);
    });
  }, []);

  // ——— ÜST ve ALT link listeleri ———
  const topLinks = [
    { href: '/', label: 'Ana Sayfa' }, 
    { href: '/jobs', label: 'İş Talepleri' },
     { href: '/jobs/new', label: 'İş Oluştur' },
    { href: '/files', label: 'Dosyalar' },     
    { href: '/board', label: 'Kanban' },
    { href: '/jobs', label: 'Görev Detay (Öz)' },
      { href: '/processes', label: 'Süreçler' },
 
  ];

  const bottomLinksBase = [
      { href: '/customer', label: 'Müşteriler' },
    { href: '/calendar', label: 'Takvim' },
     { href: 'admin/permissions', label: 'Yetkiler' },
    { href: '/settings/notifications', label: 'Bildirimler' },
    { href: '/login', label: 'Giriş' },
    { href: '/logs', label: 'Log Geçmişi' },
     { href: '/admin/users', label: 'Kullanıcı Yönetimi' },
    { href: '/admin/roles', label: 'Yetkiler' },
    { href: '/settings', label: 'Ayarlar' },
  ];

  const adminOnly = [
     { href: '/processes', label: 'Süreçler' },
    { href: '/admin/users', label: 'Kullanıcı Yönetimi' },
    { href: '/admin/roles', label: 'Yetkiler' },
    { href: '/settings', label: 'Ayarlar' },
  ];

  const bottomLinks = role === 'admin' ? [...adminOnly, ...bottomLinksBase] : [...bottomLinksBase, { href: '/settings', label: 'Ayarlar' }];

  return (
    <aside className="w-56 bg-white border-r h-screen p-4 flex flex-col">
      <div className="mb-3 text-xl font-semibold">Firma Paneli</div>

      {/* ÜST MENÜ */}
      <nav className="space-y-1">
        {topLinks.map((l) => (
          <NavItem key={l.href} href={l.href}>{l.label}</NavItem>
        ))}
      </nav>

      {/* ALT MENÜ — altta sabit durur */}
      <div className="mt-auto pt-4 border-t">
        <div className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
          Ayarlar & Diğer
        </div>
        <nav className="space-y-1">
          {bottomLinks.map((l) => (
            <NavItem key={l.href} href={l.href}>{l.label}</NavItem>
          ))}
        </nav>
      </div>
    </aside>
  );
}
