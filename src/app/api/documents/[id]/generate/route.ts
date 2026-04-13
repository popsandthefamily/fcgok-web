import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { generateDocumentSections } from '@/lib/ai/generate-document-sections';
import type { PortalDocument } from '@/lib/types/documents';
import type { OrgConfig } from '@/lib/config/industries';

export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('*, organizations(settings, slug)')
    .eq('id', id)
    .eq('organization_id', auth.orgId!)
    .single();

  if (docErr || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const document = doc as PortalDocument & { organizations: { settings: OrgConfig; slug: string } };
  const orgConfig = document.organizations.settings;
  const orgSlug = document.organizations.slug;

  await supabase.from('documents').update({ status: 'generating' }).eq('id', id);

  try {
    let intelContext = '';
    const facts = document.deal_facts;

    if (facts.city || facts.state) {
      const { data: relatedIntel } = await supabase
        .from('intel_items')
        .select('title, summary')
        .or(`title.ilike.%${facts.city ?? ''}%,title.ilike.%${facts.state ?? ''}%,summary.ilike.%${facts.city ?? ''}%`)
        .contains('client_visibility', [orgSlug])
        .not('summary', 'is', null)
        .order('relevance_score', { ascending: false })
        .limit(8);

      if (relatedIntel && relatedIntel.length > 0) {
        intelContext = relatedIntel.map((i) => `- ${i.title}: ${i.summary}`).join('\n');
      }
    }

    const sections = await generateDocumentSections(
      document.type,
      facts,
      orgConfig,
      intelContext,
    );

    await supabase
      .from('documents')
      .update({ sections, status: 'ready' })
      .eq('id', id);

    return NextResponse.json({ ok: true, sections });
  } catch (err) {
    console.error('Section generation failed:', err);
    await supabase.from('documents').update({ status: 'draft' }).eq('id', id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 },
    );
  }
}
