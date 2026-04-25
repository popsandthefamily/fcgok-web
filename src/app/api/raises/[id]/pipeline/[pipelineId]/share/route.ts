import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { SHARED_ASSET_TYPES, type SharedAsset, type SharedAssetType } from '@/lib/types/engagement';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; pipelineId: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id, pipelineId } = await params;
  const supabase = await createServiceClient();

  const { data: pipeline } = await supabase
    .from('raise_pipeline')
    .select('id')
    .eq('id', pipelineId)
    .eq('raise_id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!pipeline) return NextResponse.json({ error: 'Pipeline row not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('shared_assets')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shares: (data ?? []) as SharedAsset[] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; pipelineId: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id, pipelineId } = await params;
  const body = await request.json();

  const assetType: SharedAssetType | null = SHARED_ASSET_TYPES.includes(body?.asset_type)
    ? body.asset_type
    : null;
  const externalUrl = typeof body?.external_url === 'string' ? body.external_url.trim() : '';
  const expiresInDays = typeof body?.expires_in_days === 'number' && body.expires_in_days > 0
    ? Math.min(body.expires_in_days, 365)
    : null;

  if (!assetType) return NextResponse.json({ error: 'Invalid asset_type' }, { status: 400 });
  if (!externalUrl) return NextResponse.json({ error: 'external_url is required' }, { status: 400 });
  if (!externalUrl.startsWith('http://') && !externalUrl.startsWith('https://')) {
    return NextResponse.json({ error: 'external_url must be http(s)://...' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Verify the pipeline row + denormalize ids.
  const { data: pipeline } = await supabase
    .from('raise_pipeline')
    .select('id, raise_id, entity_id, organization_id')
    .eq('id', pipelineId)
    .eq('raise_id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!pipeline) return NextResponse.json({ error: 'Pipeline row not found' }, { status: 404 });

  const token = crypto.randomBytes(16).toString('base64url');
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
    : null;

  const { data, error } = await supabase
    .from('shared_assets')
    .insert({
      token,
      organization_id: auth.orgId,
      pipeline_id: pipeline.id,
      raise_id: pipeline.raise_id,
      entity_id: pipeline.entity_id,
      asset_type: assetType,
      asset_ref: { external_url: externalUrl },
      created_by: auth.id,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ share: data as SharedAsset }, { status: 201 });
}
