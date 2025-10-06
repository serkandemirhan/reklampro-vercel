// app/layout.tsx
import './globals.css'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Sidebar from '@/components/Sidebar' // mevcut ise
import type { ReactNode } from 'react'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const sb = createServerComponentClient({ cookies })
  const { data: { user } } = await sb.auth.getUser()

  return (
    <html lang="tr">
      <body>
        {user ? (
          <div className="flex min-h-screen">
            <aside className="w-64 shrink-0 border-r">
              <Sidebar />
            </aside>
            <main className="flex-1 p-4">
              {children}
            </main>
          </div>
        ) : (
          // Oturum yoksa sade görünüm: sadece içerik (login sayfası)
          <main className="min-h-screen p-4">
            {children}
          </main>
        )}
      </body>
    </html>
  )
}
