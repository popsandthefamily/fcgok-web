-- ============================================================
-- Phase 1: Raises + Investor Mandates + Fit Scoring
-- Run in the Supabase Dashboard SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================
--
-- Adds three tables to support capital-raise execution:
--   * raises              — org-scoped deals being raised for
--   * investor_mandates   — global, admin-curated investor criteria
--                           (one-to-many with tracked_entities)
--   * raise_fit_scores    — cached LLM rationale + last-known
--                           component breakdown per (raise, entity)
--
-- Plus a seed step that creates one inferred mandate per existing
-- tracked_entity using its deal_size_min/max + geography + categories
-- so fit scoring works on day 1.
-- ============================================================

-- Ensure SECURITY DEFINER helper functions exist (idempotent).
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM user_profiles WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.auth_user_org_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT organization_id FROM user_profiles WHERE id = auth.uid() $$;

GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_org_id() TO authenticated;

-- ── raises ───────────────────────────────────────────────────
-- The deal a capital seeker is raising for. Profile fields drive
-- fit scoring; linked_document_id pulls the OM/deck from toolkit.
CREATE TABLE IF NOT EXISTS raises (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  name                TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'closed_won', 'closed_lost')),

  -- Capital ask
  amount_sought_usd   BIGINT,
  min_check_usd       BIGINT,
  max_check_usd       BIGINT,
  use_of_funds        TEXT,

  -- Business / asset financials
  revenue_usd         BIGINT,
  noi_usd             BIGINT,
  ebitda_usd          BIGINT,
  collateral_summary  TEXT,

  -- Match dimensions
  geography           TEXT[],   -- states, MSAs, or country codes
  asset_class         TEXT,     -- self-storage, multi-family, hospitality, saas, ...
  stage               TEXT,     -- seed | growth | stabilized | distressed | development | ...
  structure           TEXT
    CHECK (structure IS NULL OR structure IN ('equity', 'debt', 'mezz', 'pref_equity', 'jv', 'convertible', 'safe', 'other')),

  -- Terms + timing
  target_close_date   DATE,
  min_terms           JSONB DEFAULT '{}',   -- { irr, em, coupon, promote, ... }

  -- Resources
  data_room_url       TEXT,
  linked_document_id  UUID REFERENCES documents(id) ON DELETE SET NULL,

  notes               TEXT,
  metadata            JSONB DEFAULT '{}',

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raises_org           ON raises(organization_id);
CREATE INDEX IF NOT EXISTS idx_raises_status        ON raises(status);
CREATE INDEX IF NOT EXISTS idx_raises_created       ON raises(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_raises_asset_class   ON raises(asset_class);

-- ── investor_mandates ────────────────────────────────────────
-- Admin-curated criteria describing what a tracked_entity will fund.
-- Global (not org-scoped), same model as tracked_entities themselves.
-- One entity may have multiple mandates (e.g. equity in storage +
-- debt in industrial).
CREATE TABLE IF NOT EXISTS investor_mandates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id           UUID NOT NULL REFERENCES tracked_entities(id) ON DELETE CASCADE,

  check_min_usd       BIGINT,
  check_max_usd       BIGINT,

  geography           TEXT[],
  asset_classes       TEXT[],
  stages              TEXT[],
  structures          TEXT[],

  -- Soft-weighted appetite signals: { distress: 0.8, opportunistic: 0.6, core: 0.2 }
  appetite            JSONB DEFAULT '{}',

  -- Denormalized rollup of the most recent intel touching this entity,
  -- maintained out-of-band by the matching layer.
  recent_activity_at  TIMESTAMPTZ,

  notes               TEXT,
  confidence          TEXT NOT NULL DEFAULT 'inferred'
    CHECK (confidence IN ('inferred', 'verified', 'self_reported')),

  source_intel_ids    UUID[] DEFAULT '{}',
  metadata            JSONB DEFAULT '{}',

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mandates_entity        ON investor_mandates(entity_id);
CREATE INDEX IF NOT EXISTS idx_mandates_geo           ON investor_mandates USING GIN (geography);
CREATE INDEX IF NOT EXISTS idx_mandates_asset_classes ON investor_mandates USING GIN (asset_classes);
CREATE INDEX IF NOT EXISTS idx_mandates_stages        ON investor_mandates USING GIN (stages);

-- ── raise_fit_scores ─────────────────────────────────────────
-- Cache for LLM rationale + last-known component breakdown.
-- Deterministic scoring is computed on demand; only the rationale
-- is sticky (keyed by raise_version_hash for invalidation).
-- organization_id is denormalized for RLS perf, mirroring outreach_sends.
CREATE TABLE IF NOT EXISTS raise_fit_scores (
  raise_id              UUID NOT NULL REFERENCES raises(id) ON DELETE CASCADE,
  entity_id             UUID NOT NULL REFERENCES tracked_entities(id) ON DELETE CASCADE,
  organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  score                 NUMERIC(5,2),
  score_components      JSONB DEFAULT '{}',
  rationale             TEXT,
  rationale_generated_at TIMESTAMPTZ,
  raise_version_hash    TEXT,

  computed_at           TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (raise_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_fit_scores_raise_score
  ON raise_fit_scores(raise_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_fit_scores_org
  ON raise_fit_scores(organization_id);

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE raises             ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_mandates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE raise_fit_scores   ENABLE ROW LEVEL SECURITY;

-- raises: members read + write within their org
DROP POLICY IF EXISTS "Org members read raises" ON raises;
CREATE POLICY "Org members read raises"
  ON raises FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members manage raises" ON raises;
CREATE POLICY "Org members manage raises"
  ON raises FOR ALL TO authenticated
  USING (organization_id = public.auth_user_org_id())
  WITH CHECK (organization_id = public.auth_user_org_id());

-- investor_mandates: all authenticated read, admins write (mirrors tracked_entities)
DROP POLICY IF EXISTS "All authenticated read mandates" ON investor_mandates;
CREATE POLICY "All authenticated read mandates"
  ON investor_mandates FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins manage mandates" ON investor_mandates;
CREATE POLICY "Admins manage mandates"
  ON investor_mandates FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- raise_fit_scores: org-scoped via denormalized organization_id
DROP POLICY IF EXISTS "Org members read fit scores" ON raise_fit_scores;
CREATE POLICY "Org members read fit scores"
  ON raise_fit_scores FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members manage fit scores" ON raise_fit_scores;
CREATE POLICY "Org members manage fit scores"
  ON raise_fit_scores FOR ALL TO authenticated
  USING (organization_id = public.auth_user_org_id())
  WITH CHECK (organization_id = public.auth_user_org_id());

-- Service role bypasses RLS, so API routes using createServiceClient
-- (the canonical pattern in src/app/api/templates/route.ts) work without
-- additional policies. The policies above gate direct client access only.

-- ── updated_at triggers ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_raises_touch ON raises;
CREATE TRIGGER trg_raises_touch
  BEFORE UPDATE ON raises
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_investor_mandates_touch ON investor_mandates;
CREATE TRIGGER trg_investor_mandates_touch
  BEFORE UPDATE ON investor_mandates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── Seed: one inferred mandate per tracked_entity ────────────
-- Idempotent: only inserts for entities that don't already have a
-- mandate row. Uses tracked_entities' existing fields as the seed.
INSERT INTO investor_mandates (
  entity_id,
  check_min_usd,
  check_max_usd,
  geography,
  asset_classes,
  confidence,
  notes
)
SELECT
  e.id,
  e.deal_size_min,
  e.deal_size_max,
  e.geography,
  e.categories,
  'inferred',
  'Seeded from tracked_entity fields. Review and mark as verified.'
FROM tracked_entities e
WHERE NOT EXISTS (
  SELECT 1 FROM investor_mandates m WHERE m.entity_id = e.id
);

-- ── Done. ────────────────────────────────────────────────────
-- Next steps (separate ships, see plan):
--   1. Raises CRUD API + portal/(app)/raise/ list and detail UI
--   2. Deterministic scoring + matches view
--   3. LLM rationale layer writing to raise_fit_scores
