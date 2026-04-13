import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

export async function GET() {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, organizations(*)')
    .eq('id', auth.id)
    .single();

  return NextResponse.json({
    user: { id: auth.id, email: auth.email },
    profile,
  });
}

export async function PUT(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { full_name } = body;

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('user_profiles')
    .update({ full_name })
    .eq('id', auth.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
