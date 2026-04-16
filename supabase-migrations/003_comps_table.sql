-- Comparable transactions — structured deal records for CRE comps.
-- Separate from intel_items: these are actual transactions with
-- verified (or AI-extracted) property-level metrics.

CREATE TABLE IF NOT EXISTS comps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Property identification
  property_name TEXT,
  address       TEXT,
  city          TEXT,
  state         TEXT,
  zip           TEXT,

  -- Transaction details
  sale_price    BIGINT,
  sale_date     DATE,
  buyer         TEXT,
  seller        TEXT,

  -- Asset metrics
  asset_type    TEXT,         -- self-storage, multi-family, hospitality, etc.
  units         INTEGER,
  square_feet   INTEGER,
  lot_acres     NUMERIC(10,2),
  year_built    INTEGER,

  -- Derived / entered metrics
  price_per_unit INTEGER,
  price_per_sf   NUMERIC(10,2),
  cap_rate       NUMERIC(5,2),
  noi            BIGINT,

  -- Provenance
  source         TEXT DEFAULT 'manual',  -- manual | ai_extracted | imported
  source_intel_id UUID REFERENCES intel_items(id) ON DELETE SET NULL,
  notes          TEXT,
  verified       BOOLEAN DEFAULT false,

  -- Meta
  created_by     UUID,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comps_org ON comps(organization_id);
CREATE INDEX IF NOT EXISTS idx_comps_asset ON comps(asset_type);
CREATE INDEX IF NOT EXISTS idx_comps_date ON comps(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_comps_city_state ON comps(state, city);

-- RLS: users see only their org's comps
ALTER TABLE comps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comps_read" ON comps FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "comps_write" ON comps FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "comps_update" ON comps FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "comps_delete" ON comps FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Service role bypasses RLS, so cron / AI extraction works without special policies.
