import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

export async function PUT(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization associated' }, { status: 400 });

  const body = await request.json();
  const { name, settings } = body;

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('organizations')
    .update({ name, settings })
    .eq('id', auth.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
