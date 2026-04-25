// Deterministic fit scoring for (raise, investor) pairs.
//
// Each sub-fit returns a 0–1 ratio with a human-readable reason.
// Components multiply ratios by their fixed weight; total is 0–100.
// Rationale lives in the next ship (LLM rewrite of these reasons).

import type { Raise, InvestorMandate, RaiseFitScoreComponents } from '@/lib/types/raises';
import type { TrackedEntity } from '@/lib/types';

export const FIT_WEIGHTS = {
  asset_class: 25,
  geography:   20,
  check_size:  18,
  structure:   15,
  stage:       10,
  recency:      8,
  warmth:       4,
} as const;

export const FIT_WEIGHT_TOTAL =
  FIT_WEIGHTS.asset_class +
  FIT_WEIGHTS.geography +
  FIT_WEIGHTS.check_size +
  FIT_WEIGHTS.structure +
  FIT_WEIGHTS.stage +
  FIT_WEIGHTS.recency +
  FIT_WEIGHTS.warmth;

export interface FitInput {
  raise: Raise;
  entity: TrackedEntity;
  mandate: InvestorMandate | null;
}

export interface FitResult {
  score: number;                       // 0–100
  components: RaiseFitScoreComponents; // points per component (not ratio)
  reasons: string[];                   // top 3 explanations
}

function lowerSet(arr: string[] | null | undefined): Set<string> {
  if (!arr) return new Set();
  return new Set(arr.map((s) => s.trim().toLowerCase()).filter(Boolean));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface SubFit {
  fit: number;          // 0–1
  reason: string | null;
}

function fitAssetClass(raise: Raise, mandate: InvestorMandate | null): SubFit {
  if (!raise.asset_class) return { fit: 0.5, reason: null };
  if (!mandate?.asset_classes?.length) return { fit: 0.5, reason: null };
  const target = raise.asset_class.toLowerCase();
  if (lowerSet(mandate.asset_classes).has(target)) {
    return { fit: 1, reason: `Asset class match: ${raise.asset_class}` };
  }
  return { fit: 0, reason: `Asset class outside mandate (${raise.asset_class})` };
}

function fitGeography(raise: Raise, mandate: InvestorMandate | null): SubFit {
  if (!raise.geography?.length) return { fit: 0.5, reason: null };
  if (!mandate?.geography?.length) return { fit: 0.5, reason: null };
  const raiseSet = lowerSet(raise.geography);
  const mandateSet = lowerSet(mandate.geography);
  const overlap = [...raiseSet].filter((g) => mandateSet.has(g));
  if (overlap.length === 0) return { fit: 0, reason: 'No geography overlap with mandate' };
  return {
    fit: overlap.length / raiseSet.size,
    reason: `Geography overlap: ${overlap.join(', ')}`,
  };
}

function fitCheckSize(raise: Raise, mandate: InvestorMandate | null): SubFit {
  const raiseLo = raise.min_check_usd;
  const raiseHi = raise.max_check_usd ?? raise.amount_sought_usd;
  const mLo = mandate?.check_min_usd ?? null;
  const mHi = mandate?.check_max_usd ?? null;

  const raiseHasData = raiseLo != null || raiseHi != null;
  const mandateHasData = mLo != null || mHi != null;
  if (!raiseHasData || !mandateHasData) return { fit: 0.5, reason: null };

  const aLo = raiseLo ?? 0;
  const aHi = raiseHi ?? Number.POSITIVE_INFINITY;
  const bLo = mLo ?? 0;
  const bHi = mHi ?? Number.POSITIVE_INFINITY;

  if (aHi < bLo || bHi < aLo) {
    return { fit: 0, reason: 'Check size outside mandate range' };
  }
  return { fit: 1, reason: 'Check size within mandate range' };
}

function fitStructure(raise: Raise, mandate: InvestorMandate | null): SubFit {
  if (!raise.structure) return { fit: 0.5, reason: null };
  if (!mandate?.structures?.length) return { fit: 0.5, reason: null };
  if (lowerSet(mandate.structures).has(raise.structure.toLowerCase())) {
    return { fit: 1, reason: `Structure match: ${raise.structure}` };
  }
  return { fit: 0, reason: `Structure outside mandate (${raise.structure})` };
}

function fitStage(raise: Raise, mandate: InvestorMandate | null): SubFit {
  if (!raise.stage) return { fit: 0.5, reason: null };
  if (!mandate?.stages?.length) return { fit: 0.5, reason: null };
  if (lowerSet(mandate.stages).has(raise.stage.toLowerCase())) {
    return { fit: 1, reason: `Stage match: ${raise.stage}` };
  }
  return { fit: 0, reason: `Stage outside mandate (${raise.stage})` };
}

function fitRecency(entity: TrackedEntity, mandate: InvestorMandate | null): SubFit {
  const lastActivity = mandate?.recent_activity_at ?? entity.last_activity_at;
  if (!lastActivity) return { fit: 0, reason: null };
  const days = (Date.now() - new Date(lastActivity).getTime()) / 86_400_000;
  const fit = Math.max(0, Math.min(1, 1 - days / 365));
  if (days < 30) return { fit, reason: `Active in last month` };
  if (days < 90) return { fit, reason: `Active ${Math.floor(days / 7)} weeks ago` };
  if (days < 365) return { fit, reason: `Active ${Math.floor(days / 30)} months ago` };
  return { fit, reason: `Last active over a year ago` };
}

export function scoreFit(input: FitInput): FitResult {
  const { raise, entity, mandate } = input;

  const aClass    = fitAssetClass(raise, mandate);
  const geo       = fitGeography(raise, mandate);
  const check     = fitCheckSize(raise, mandate);
  const struct    = fitStructure(raise, mandate);
  const stage     = fitStage(raise, mandate);
  const recency   = fitRecency(entity, mandate);
  const warmth: SubFit = { fit: 0, reason: null }; // stub; warm-intro graph is deferred

  const components: RaiseFitScoreComponents = {
    asset_class: round2(aClass.fit  * FIT_WEIGHTS.asset_class),
    geography:   round2(geo.fit     * FIT_WEIGHTS.geography),
    check_size:  round2(check.fit   * FIT_WEIGHTS.check_size),
    structure:   round2(struct.fit  * FIT_WEIGHTS.structure),
    stage:       round2(stage.fit   * FIT_WEIGHTS.stage),
    recency:     round2(recency.fit * FIT_WEIGHTS.recency),
    warmth:      round2(warmth.fit  * FIT_WEIGHTS.warmth),
  };

  const score = round2(
    (components.asset_class ?? 0) +
    (components.geography   ?? 0) +
    (components.check_size  ?? 0) +
    (components.structure   ?? 0) +
    (components.stage       ?? 0) +
    (components.recency     ?? 0) +
    (components.warmth      ?? 0),
  );

  const reasonsRaw: { reason: string; weight: number }[] = [];
  if (aClass.reason)  reasonsRaw.push({ reason: aClass.reason,  weight: components.asset_class ?? 0 });
  if (geo.reason)     reasonsRaw.push({ reason: geo.reason,     weight: components.geography ?? 0 });
  if (check.reason)   reasonsRaw.push({ reason: check.reason,   weight: components.check_size ?? 0 });
  if (struct.reason)  reasonsRaw.push({ reason: struct.reason,  weight: components.structure ?? 0 });
  if (stage.reason)   reasonsRaw.push({ reason: stage.reason,   weight: components.stage ?? 0 });
  if (recency.reason) reasonsRaw.push({ reason: recency.reason, weight: components.recency ?? 0 });

  const reasons = reasonsRaw
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((r) => r.reason);

  return { score, components, reasons };
}
