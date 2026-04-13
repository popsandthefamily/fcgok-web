import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { DealFacts, DocumentType, DocumentTemplate } from '@/lib/types/documents';

export async function GET() {
  const auth = await getAuthedUser();
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
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization associated with this account' }, { status: 400 });

  const body = (await request.json()) as {
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
      created_by: auth.id,
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
