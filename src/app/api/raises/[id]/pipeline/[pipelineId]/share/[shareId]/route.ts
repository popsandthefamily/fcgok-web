import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

// Revoke a share by setting revoked_at. The share row stays for the
// audit trail; the public viewer treats revoked shares as 410 Gone.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; pipelineId: string; shareId: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { pipelineId, shareId } = await params;
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from('shared_assets')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', shareId)
    .eq('pipeline_id', pipelineId)
    .eq('organization_id', auth.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
