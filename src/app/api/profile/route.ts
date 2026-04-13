import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = await createServiceClient();
  const { data: profile, error: profileError } = await service
    .from('user_profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: `Profile query failed: ${profileError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email ?? null },
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
