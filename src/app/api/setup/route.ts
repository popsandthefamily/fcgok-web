import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { OrgConfig } from '@/lib/config/industries';

export async function GET() {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id, role, organizations(*)')
    .eq('id', auth.id)
    .single();

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization associated' }, { status: 400 });
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Admin access required to run setup' }, { status: 403 });

  const body = (await request.json()) as { config: OrgConfig; orgName?: string };
  const completedConfig = {
    ...body.config,
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
  };

  const updates: Record<string, unknown> = { settings: completedConfig };
  if (body.orgName) updates.name = body.orgName;

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', auth.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
