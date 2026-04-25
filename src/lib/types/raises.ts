// Types for Phase 1: Raises + Investor Mandates + Fit Scoring.
// Mirrors columns in supabase-migrations/005_raises_and_fit_scoring.sql.

export type RaiseStatus = 'draft' | 'active' | 'paused' | 'closed_won' | 'closed_lost';

export type RaiseStructure =
  | 'equity'
  | 'debt'
  | 'mezz'
  | 'pref_equity'
  | 'jv'
  | 'convertible'
  | 'safe'
  | 'other';

export interface RaiseMinTerms {
  irr_pct?: number;
  equity_multiple?: number;
  coupon_pct?: number;
  promote?: string;
  preferred_return_pct?: number;
}

export interface Raise {
  id: string;
  organization_id: string;
  created_by: string | null;

  name: string;
  status: RaiseStatus;

  amount_sought_usd: number | null;
  min_check_usd: number | null;
  max_check_usd: number | null;
  use_of_funds: string | null;

  revenue_usd: number | null;
  noi_usd: number | null;
  ebitda_usd: number | null;
  collateral_summary: string | null;

  geography: string[] | null;
  asset_class: string | null;
  stage: string | null;
  structure: RaiseStructure | null;

  target_close_date: string | null;
  min_terms: RaiseMinTerms;

  data_room_url: string | null;
  linked_document_id: string | null;

  notes: string | null;
  metadata: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

export type MandateConfidence = 'inferred' | 'verified' | 'self_reported';

export interface InvestorMandate {
  id: string;
  entity_id: string;

  check_min_usd: number | null;
  check_max_usd: number | null;

  geography: string[] | null;
  asset_classes: string[] | null;
  stages: string[] | null;
  structures: string[] | null;

  appetite: Record<string, number>;

  recent_activity_at: string | null;

  notes: string | null;
  confidence: MandateConfidence;

  source_intel_ids: string[];
  metadata: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

export interface RaiseFitScoreComponents {
  asset_class?: number;
  geography?: number;
  check_size?: number;
  structure?: number;
  stage?: number;
  recency?: number;
  warmth?: number;
}

export interface RaiseFitScore {
  raise_id: string;
  entity_id: string;
  organization_id: string;

  score: number | null;
  score_components: RaiseFitScoreComponents;
  rationale: string | null;
  rationale_generated_at: string | null;
  raise_version_hash: string | null;

  computed_at: string;
}

export const RAISE_STATUS_LABELS: Record<RaiseStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  closed_won: 'Closed — Won',
  closed_lost: 'Closed — Lost',
};

export const RAISE_STRUCTURE_LABELS: Record<RaiseStructure, string> = {
  equity: 'Equity',
  debt: 'Debt',
  mezz: 'Mezzanine',
  pref_equity: 'Preferred Equity',
  jv: 'Joint Venture',
  convertible: 'Convertible',
  safe: 'SAFE',
  other: 'Other',
};
