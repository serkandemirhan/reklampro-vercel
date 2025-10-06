// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()

  const url = req.nextUrl
  const pathname = url.pathname

  // serbest rotalar: login/signup, api, statikler vs.
  const publicPaths = [
    '/login',
    '/signup',
  ]
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p))
  const isAsset = pathname.startsWith('/_next') || pathname.startsWith('/assets') || pathname.startsWith('/public') || pathname.endsWith('.ico')

  if (!user && !isPublic && !isAsset) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname) // login sonrası geri dönebilmek için
    return NextResponse.redirect(loginUrl)
  }

  return res
}

// Bu desenler middleware'i tetikler (public rotaları hariç)
export const config = {
  matcher: [
    '/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
