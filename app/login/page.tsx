// app/login/page.tsx
import QuickLogin from '@/components/auth/QuickLogin'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold text-center">Giriş Yap</h1>
        <QuickLogin redirectPath="/" />
        <p className="text-xs text-gray-500 text-center">
          Demo kısayolları sadece hızlı test içindir. Canlıya çıkarken kaldırın veya gizleyin.
        </p>
      </div>
    </div>
  )
}
