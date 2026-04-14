import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST-only: GET used to work here but Next.js prefetches <Link> targets,
// which meant as soon as the sidebar mounted it silently signed the user
// out. Any side-effecting handler must live on a non-idempotent verb.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/portal/login', request.url), { status: 303 });
}
