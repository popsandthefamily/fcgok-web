import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { generateOutreachDraft } from '@/lib/ai/draft-outreach';
import type { Raise, InvestorMandate } from '@/lib/types/raises';
import type { TrackedEntity, IntelItem } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; pipelineId: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id, pipelineId } = await params;
  const body = await request.json();
  const templateId = typeof body?.template_id === 'string' ? body.template_id : null;
  if (!templateId) return NextResponse.json({ error: 'template_id is required' }, { status: 400 });

  const supabase = await createServiceClient();

  // Fetch raise + pipeline row + template + mandate + entity + recent intel in parallel.
  const [raiseRes, pipelineRes, templateRes] = await Promise.all([
    supabase.from('raises').select('*').eq('id', id).eq('organization_id', auth.orgId).single(),
    supabase.from('raise_pipeline').select('*').eq('id', pipelineId).eq('raise_id', id).eq('organization_id', auth.orgId).single(),
    supabase.from('outreach_templates').select('id, title, category, subject, body').eq('id', templateId).eq('organization_id', auth.orgId).single(),
  ]);

  if (!raiseRes.data) return NextResponse.json({ error: 'Raise not found' }, { status: 404 });
  if (!pipelineRes.data) return NextResponse.json({ error: 'Pipeline row not found' }, { status: 404 });
  if (!templateRes.data) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const raise = raiseRes.data as Raise;
  const entityId = (pipelineRes.data as { entity_id: string }).entity_id;
  const template = templateRes.data as { id: string; title: string; category: string; subject: string; body: string };

  const [entityRes, mandatesRes, linksRes] = await Promise.all([
    supabase.from('tracked_entities').select('*').eq('id', entityId).single(),
    supabase.from('investor_mandates').select('*').eq('entity_id', entityId),
    supabase.from('entity_intel_links').select('intel_item:intel_items(*)').eq('entity_id', entityId),
  ]);

  if (!entityRes.data) return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
  const entity = entityRes.data as TrackedEntity;

  const mandates = (mandatesRes.data ?? []) as InvestorMandate[];
  const mandate = mandates.length
    ? mandates.reduce((best, m) => {
        const rank = (c: InvestorMandate['confidence']) => (c === 'verified' ? 3 : c === 'self_reported' ? 2 : 1);
        return rank(m.confidence) > rank(best.confidence) ? m : best;
      })
    : null;

  type LinkRow = { intel_item: IntelItem[] | null };
  const intelItems: IntelItem[] = [];
  for (const link of (linksRes.data ?? []) as LinkRow[]) {
    for (const item of link.intel_item ?? []) intelItems.push(item);
  }
  intelItems.sort((a, b) => {
    const da = a.published_at ? new Date(a.published_at).getTime() : 0;
    const db = b.published_at ? new Date(b.published_at).getTime() : 0;
    return db - da;
  });

  try {
    const draft = await generateOutreachDraft({
      template,
      raise,
      entity,
      mandate,
      intelItems: intelItems.slice(0, 5),
    });
    return NextResponse.json({ draft, template_id: template.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
