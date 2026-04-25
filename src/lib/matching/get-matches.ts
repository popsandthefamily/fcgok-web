import type { SupabaseClient } from '@supabase/supabase-js';
import { scoreFit, FIT_WEIGHTS, type FitResult } from './score';
import type { Raise, InvestorMandate } from '@/lib/types/raises';
import type { TrackedEntity } from '@/lib/types';

export interface RaiseMatch {
  entity: TrackedEntity;
  mandate: InvestorMandate | null;
  fit: FitResult;
  rationale: string | null;
  rationale_generated_at: string | null;
  rationale_stale: boolean;       // true when cached rationale exists but raise has been edited since
}

export interface RaiseMatchesResult {
  matches: RaiseMatch[];
  weights: typeof FIT_WEIGHTS;
}

function confidenceRank(c: InvestorMandate['confidence']): number {
  return c === 'verified' ? 3 : c === 'self_reported' ? 2 : 1;
}

export async function computeRaiseMatches(
  supabase: SupabaseClient,
  raise: Raise,
  limit: number = 25,
): Promise<RaiseMatchesResult> {
  const [{ data: entitiesRaw }, { data: mandatesRaw }] = await Promise.all([
    supabase.from('tracked_entities').select('*'),
    supabase.from('investor_mandates').select('*'),
  ]);

  const entities = (entitiesRaw ?? []) as TrackedEntity[];
  const mandates = (mandatesRaw ?? []) as InvestorMandate[];

  // Multiple mandates per entity supported; pick the highest-confidence one.
  const mandateByEntity = new Map<string, InvestorMandate>();
  for (const m of mandates) {
    const existing = mandateByEntity.get(m.entity_id);
    if (!existing || confidenceRank(m.confidence) > confidenceRank(existing.confidence)) {
      mandateByEntity.set(m.entity_id, m);
    }
  }

  const ranked = entities
    .map((entity) => {
      const mandate = mandateByEntity.get(entity.id) ?? null;
      const fit = scoreFit({ raise, entity, mandate });
      return { entity, mandate, fit };
    })
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, limit);

  // Pull cached rationales for these top-N entities only.
  type CacheRow = {
    entity_id: string;
    rationale: string | null;
    rationale_generated_at: string | null;
    raise_version_hash: string | null;
  };
  const cacheByEntity = new Map<string, CacheRow>();
  if (ranked.length > 0) {
    const { data: cache } = await supabase
      .from('raise_fit_scores')
      .select('entity_id, rationale, rationale_generated_at, raise_version_hash')
      .eq('raise_id', raise.id)
      .in('entity_id', ranked.map((r) => r.entity.id));
    for (const row of (cache ?? []) as CacheRow[]) {
      cacheByEntity.set(row.entity_id, row);
    }
  }

  const matches: RaiseMatch[] = ranked.map((m) => {
    const cached = cacheByEntity.get(m.entity.id);
    const hasRationale = cached?.rationale != null;
    const stale = hasRationale && cached?.raise_version_hash !== raise.updated_at;
    return {
      ...m,
      rationale: cached?.rationale ?? null,
      rationale_generated_at: cached?.rationale_generated_at ?? null,
      rationale_stale: stale,
    };
  });

  return { matches, weights: FIT_WEIGHTS };
}
