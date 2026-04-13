import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { DealFacts, DocumentType, DocumentTemplate } from '@/lib/types/documents';

async function getUserOrg() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  return { userId: user.id, orgId: profile?.organization_id as string | undefined };
}

export async function GET() {
  const auth = await getUserOrg();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ documents: [] });

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('organization_id', auth.orgId)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await getUserOrg();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const body = await request.json() as {
    type: DocumentType;
    deal_name: string;
    template?: DocumentTemplate;
    deal_facts?: DealFacts;
  };

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('documents')
    .insert({
      organization_id: auth.orgId,
      created_by: auth.userId,
      type: body.type,
      deal_name: body.deal_name,
      template: body.template ?? 'modern',
      deal_facts: body.deal_facts ?? {},
      sections: [],
      status: 'draft',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document: data }, { status: 201 });
}
