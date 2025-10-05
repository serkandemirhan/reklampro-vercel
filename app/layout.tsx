
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = { title: 'Process Tracker' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <div className="min-h-screen flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <header className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Process Tracker</h1>
              <div className="flex items-center gap-2"><a href="/login" className="link">Giriş/Kayıt</a>
                <input placeholder="Ara..." className="input w-64" />
              </div>
            </header>
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
