// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function assertAdmin(user: any) {
  const role = user?.app_metadata?.role;
  if (role !== 'admin' && role !== 'manager') throw new Error('forbidden');
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try { assertAdmin(user); } catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }); }

  const body = await req.json(); // { role?, tenant_id?, password?, email? }
  const updates: any = {};
  if (body.email) updates.email = body.email;
  if (body.password) updates.password = body.password;
  if (body.role || body.tenant_id) {
    updates.app_metadata = {
      ...(body.role ? { role: body.role } : {}),
      ...(body.tenant_id != null ? { tenant_id: Number(body.tenant_id) } : {})
    };
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(params.id, updates);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    id: data.user?.id,
    email: data.user?.email,
    role: data.user?.app_metadata?.role,
    tenant_id: data.user?.app_metadata?.tenant_id
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try { assertAdmin(user); } catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }); }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
