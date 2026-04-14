import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface LoginBody {
  email?: string;
  password?: string;
}

// Server-side login so the Supabase session is written as Set-Cookie
// headers by the response, rather than via document.cookie on the
// browser. Browser-side writes were silently dropping the sb-*-auth
// cookies behind Cloudflare, causing the route handlers to 401.
export async function POST(request: Request) {
  const { email, password } = (await request.json()) as LoginBody;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? 'Invalid credentials' },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true, userId: data.user.id });
}
