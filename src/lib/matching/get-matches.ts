import type { SupabaseClient } from '@supabase/supabase-js';
import { scoreFit, FIT_WEIGHTS, type FitResult } from './score';
import type { Raise, InvestorMandate } from '@/lib/types/raises';
import type { TrackedEntity } from '@/lib/types';

export interface RaiseMatch {
  entity: TrackedEntity;
  mandate: InvestorMandate | null;
  fit: FitResult;
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

  const matches: RaiseMatch[] = entities
    .map((entity) => {
      const mandate = mandateByEntity.get(entity.id) ?? null;
      const fit = scoreFit({ raise, entity, mandate });
      return { entity, mandate, fit };
    })
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, limit);

  return { matches, weights: FIT_WEIGHTS };
}
