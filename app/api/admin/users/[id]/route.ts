// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function assertAdmin(user: any) {
  const role = user?.app_metadata?.role;
  if (role !== 'admin' && role !== 'manager') throw new Error('forbidden');
}

export async function GET() {
  // Listele (admin)
  const sb = createRouteHandlerClient({ cookies });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try { assertAdmin(user); } catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }); }

  // Auth kullanıcılarını listele (ilk 200)
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Sadece gerekli alanları dön
  return NextResponse.json(
    data.users.map(u => ({
      id: u.id,
      email: u.email,
      role: (u.app_metadata as any)?.role ?? null,
      tenant_id: (u.app_metadata as any)?.tenant_id ?? null,
      created_at: u.created_at
    }))
  );
}

export async function POST(req: NextRequest) {
  // Kullanıcı oluştur (admin)
  const sb = createRouteHandlerClient({ cookies });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try { assertAdmin(user); } catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }); }

  const body = await req.json(); // { email, password?, role, tenant_id, email_confirmed? }
  const email = String(body.email || '').trim();
  const password = body.password || undefined;
  const role = body.role || 'operator';
  const tenant_id = Number(body.tenant_id ?? 1);
  const email_confirm = body.email_confirmed ?? true; // invite yerine direkt aktif

  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm,
    app_metadata: { role, tenant_id },
    user_metadata: { name: body.name ?? '' }
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    id: created.user?.id,
    email: created.user?.email,
    role, tenant_id
  });
}
