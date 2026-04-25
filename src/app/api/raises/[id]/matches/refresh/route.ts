import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { computeRaiseMatches } from '@/lib/matching/get-matches';
import { generateRationale } from '@/lib/matching/rationale';
import type { Raise } from '@/lib/types/raises';
import type { IntelItem } from '@/lib/types';

// Concurrency for parallel LLM calls. Groq + Anthropic both handle this fine
// at this volume; tune down if rate limits become an issue.
const BATCH_SIZE = 5;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id } = await params;
  const url = new URL(request.url);
  const limitRaw = parseInt(url.searchParams.get('limit') ?? '25', 10);
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 25, 1), 50);

  const supabase = await createServiceClient();
  const { data: raise } = await supabase
    .from('raises')
    .select('*')
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!raise) return NextResponse.json({ error: 'Raise not found' }, { status: 404 });

  const { matches } = await computeRaiseMatches(supabase, raise as Raise, limit);

  // Skip entities whose cached rationale is already current — avoid wasted LLM calls.
  const versionHash = (raise as Raise).updated_at;
  const toGenerate = matches.filter((m) => m.rationale == null || m.rationale_stale);

  if (toGenerate.length === 0) {
    return NextResponse.json({ written: 0, skipped: matches.length, errors: [], total: matches.length });
  }

  // Batch-fetch recent intel for all entities we're generating for.
  const intelByEntity = new Map<string, IntelItem[]>();
  const entityIds = toGenerate.map((m) => m.entity.id);
  if (entityIds.length > 0) {
    // supabase-js infers nested selects as arrays even for many-to-one joins,
    // so we flatten. In practice each link row has exactly one item.
    type LinkRow = { entity_id: string; intel_item: IntelItem[] | null };
    const { data: links } = await supabase
      .from('entity_intel_links')
      .select('entity_id, intel_item:intel_items(*)')
      .in('entity_id', entityIds);
    for (const link of (links ?? []) as LinkRow[]) {
      for (const item of link.intel_item ?? []) {
        const list = intelByEntity.get(link.entity_id) ?? [];
        list.push(item);
        intelByEntity.set(link.entity_id, list);
      }
    }
    for (const [eid, list] of intelByEntity) {
      list.sort((a, b) => {
        const da = a.published_at ? new Date(a.published_at).getTime() : 0;
        const db = b.published_at ? new Date(b.published_at).getTime() : 0;
        return db - da;
      });
      intelByEntity.set(eid, list.slice(0, 5));
    }
  }

  const generatedAt = new Date().toISOString();
  const errors: { entity_id: string; error: string }[] = [];
  let written = 0;

  for (let i = 0; i < toGenerate.length; i += BATCH_SIZE) {
    const batch = toGenerate.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((m) =>
        generateRationale({
          raise: raise as Raise,
          entity: m.entity,
          mandate: m.mandate,
          intelItems: intelByEntity.get(m.entity.id) ?? [],
          fit: m.fit,
        }).then((rationale) => ({ match: m, rationale })),
      ),
    );

    const rowsToUpsert: Record<string, unknown>[] = [];
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled') {
        const { match, rationale } = r.value;
        rowsToUpsert.push({
          raise_id: id,
          entity_id: match.entity.id,
          organization_id: auth.orgId,
          score: match.fit.score,
          score_components: match.fit.components,
          rationale,
          rationale_generated_at: generatedAt,
          raise_version_hash: versionHash,
          computed_at: generatedAt,
        });
      } else {
        errors.push({
          entity_id: batch[j].entity.id,
          error: r.reason instanceof Error ? r.reason.message : String(r.reason),
        });
      }
    }

    if (rowsToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('raise_fit_scores')
        .upsert(rowsToUpsert, { onConflict: 'raise_id,entity_id' });
      if (upsertError) {
        return NextResponse.json(
          { error: `Upsert failed: ${upsertError.message}`, written, errors },
          { status: 500 },
        );
      }
      written += rowsToUpsert.length;
    }
  }

  return NextResponse.json({
    written,
    skipped: matches.length - toGenerate.length,
    errors,
    total: matches.length,
  });
}
