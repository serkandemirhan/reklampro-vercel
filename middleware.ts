// middleware.ts
import { NextRequest } from 'next/server';
import { updateSession } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  // Supabase auth çerezlerini güncel tutar (SSR/api route'larda oturum görünür)
  return await updateSession(req);
}

// _next/static vb. hariç tüm route’larda çalışsın:
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
