// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // server only
  { auth: { persistSession: false }, global: { headers: { 'X-Client-Info': 'admin-route' } } }
);
