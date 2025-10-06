// components/auth/QuickLogin.tsx
'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = {
  redirectPath?: string // başarıda yönlenecek sayfa (varsayılan '/')
}

export default function QuickLogin({ redirectPath = '/' }: Props) {
  const sp = useSearchParams()
  const next = sp.get('next') // /login?next=/jobs gibi
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signIn(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.replace(next || redirectPath)
  }

  async function quick(email: string, password: string) {
    setEmail(email)
    setPassword(password)
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.replace(next || redirectPath)
  }

  return (
    <div className="space-y-6">
      {/* Hızlı giriş kutuları */}
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => quick('manager@firma.com', '123456')}
          disabled={loading}
          className="w-full rounded-xl border px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="font-medium">Yönetici olarak gir</div>
          <div className="text-xs text-gray-500">manager@firma.com / 123456</div>
        </button>

        <button
          onClick={() => quick('operator@firma.com', '123456')}
          disabled={loading}
          className="w-full rounded-xl border px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="font-medium">Operatör olarak gir</div>
          <div className="text-xs text-gray-500">operator@firma.com / 123456</div>
        </button>

        <button
          onClick={() => quick('admin@firma.com', '123456')}
          disabled={loading}
          className="w-full rounded-xl border px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="font-medium">Admin olarak gir</div>
          <div className="text-xs text-gray-500">admin@firma.com / 123456</div>
        </button>
      </div>

      {/* Ayraç */}
      <div className="flex items-center gap-3">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs text-gray-400">veya</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      {/* Normal giriş formu */}
      <form onSubmit={signIn} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">E-posta</label>
          <input
            type="email"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mail@domain.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Şifre</label>
          <input
            type="password"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
        </button>
      </form>
    </div>
  )
}
