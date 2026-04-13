import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { OrgConfig } from '@/lib/config/industries';

export async function GET() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id, role, organizations(*)')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) {
    return NextResponse.json({ error: 'No organization associated' }, { status: 400 });
  }
  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required to run setup' }, { status: 403 });
  }

  const body = (await request.json()) as { config: OrgConfig; orgName?: string };
  const completedConfig = {
    ...body.config,
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
  };

  const updates: Record<string, unknown> = { settings: completedConfig };
  if (body.orgName) updates.name = body.orgName;

  const { error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', profile.organization_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
