-- ============================================================
-- Phase 3: Engagement Tracking — share links, events, rollups
-- Run in the Supabase Dashboard SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================
--
-- Adds three tables + a trigger to track investor engagement with
-- shared materials (decks, OMs, data rooms, links in outreach):
--
--   * shared_assets        — tokenized link per (pipeline_row, asset);
--                            token gates the public viewer
--   * engagement_events    — append-only event log: email_open,
--                            link_click, document_view, section_view,
--                            data_room_*, etc.
--   * engagement_rollups   — per-pipeline counters maintained by
--                            trigger; keeps Kanban renders fast
--
-- The trigger on engagement_events insert does TWO things:
--   1. Bumps the matching counter on engagement_rollups (UPSERT)
--   2. Mirrors a row into raise_pipeline_events with event_type =
--      'engagement' — Phase 2's timeline stays single source of truth
--
-- Public tracking endpoints (/s/[token], /api/track/*) will use the
-- service client and authorize by token + raise.organization_id match.
-- The RLS policies below gate direct authenticated-client access only.
-- ============================================================

CREATE OR REPLACE FUNCTION public.auth_user_org_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT organization_id FROM user_profiles WHERE id = auth.uid() $$;

GRANT EXECUTE ON FUNCTION public.auth_user_org_id() TO authenticated;

-- ── shared_assets ────────────────────────────────────────────
-- A tokenized link for a specific (pipeline_row, asset). When an
-- investor clicks it, the public viewer logs an engagement_event
-- and renders/redirects to the underlying asset.
--
-- asset_ref jsonb shape:
--   {document_id: uuid}                     for OMs/decks in `documents`
--   {storage_path: "data-rooms/raise-x/..."} for Supabase Storage files
--   {external_url: "https://drive.google..."}for external data rooms
CREATE TABLE IF NOT EXISTS shared_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token           TEXT UNIQUE NOT NULL,

  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline_id     UUID NOT NULL REFERENCES raise_pipeline(id) ON DELETE CASCADE,
  raise_id        UUID NOT NULL REFERENCES raises(id) ON DELETE CASCADE,
  entity_id       UUID NOT NULL REFERENCES tracked_entities(id) ON DELETE CASCADE,

  asset_type      TEXT NOT NULL CHECK (asset_type IN (
    'pitch_deck',
    'om',
    'data_room',
    'market_snapshot',
    'comps',
    'followup_link',
    'other'
  )),
  asset_ref       JSONB NOT NULL DEFAULT '{}',

  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at      TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_assets_pipeline ON shared_assets(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_shared_assets_raise    ON shared_assets(raise_id);
CREATE INDEX IF NOT EXISTS idx_shared_assets_entity   ON shared_assets(entity_id);
CREATE INDEX IF NOT EXISTS idx_shared_assets_org      ON shared_assets(organization_id);

-- ── engagement_events ────────────────────────────────────────
-- Append-only event log. shared_asset_id is nullable for events that
-- come in before we resolve the asset (rare; mostly defensive).
CREATE TABLE IF NOT EXISTS engagement_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_asset_id UUID REFERENCES shared_assets(id) ON DELETE SET NULL,
  pipeline_id     UUID NOT NULL REFERENCES raise_pipeline(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  event_type      TEXT NOT NULL CHECK (event_type IN (
    'email_open',
    'link_click',
    'document_view',
    'document_download',
    'page_view',
    'section_view',
    'data_room_login',
    'data_room_file_view'
  )),
  event_subtype   TEXT,
  ip_inet         INET,
  user_agent      TEXT,
  referer         TEXT,
  payload         JSONB DEFAULT '{}',

  occurred_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagement_pipeline ON engagement_events(pipeline_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_asset    ON engagement_events(shared_asset_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_org      ON engagement_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_engagement_type     ON engagement_events(event_type);

-- ── engagement_rollups ───────────────────────────────────────
-- Per-pipeline counters maintained by the trigger below. Avoids
-- aggregation queries on every Kanban card render.
CREATE TABLE IF NOT EXISTS engagement_rollups (
  pipeline_id          UUID PRIMARY KEY REFERENCES raise_pipeline(id) ON DELETE CASCADE,
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  deck_views           INTEGER NOT NULL DEFAULT 0,
  om_views             INTEGER NOT NULL DEFAULT 0,
  data_room_visits     INTEGER NOT NULL DEFAULT 0,
  email_opens          INTEGER NOT NULL DEFAULT 0,
  link_clicks          INTEGER NOT NULL DEFAULT 0,

  last_engagement_at   TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rollups_org
  ON engagement_rollups(organization_id);
CREATE INDEX IF NOT EXISTS idx_rollups_last_engagement
  ON engagement_rollups(last_engagement_at DESC NULLS LAST);

-- ── Trigger: bump rollup + mirror to raise_pipeline_events ───
-- Runs AFTER INSERT on engagement_events. Single trigger does both
-- counter maintenance and timeline mirroring so we never have an
-- engagement signal that isn't visible on the Kanban or in the
-- per-investor activity feed.
CREATE OR REPLACE FUNCTION public.engagement_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  asset_type_val   TEXT;
  delta_deck       INTEGER := 0;
  delta_om         INTEGER := 0;
  delta_data_room  INTEGER := 0;
  delta_open       INTEGER := 0;
  delta_click      INTEGER := 0;
  pipeline_payload JSONB;
BEGIN
  -- Resolve the asset type from the join (NULL when shared_asset_id is unset).
  IF NEW.shared_asset_id IS NOT NULL THEN
    SELECT asset_type INTO asset_type_val FROM shared_assets WHERE id = NEW.shared_asset_id;
  END IF;

  -- Pick which counter to bump.
  IF NEW.event_type IN ('document_view', 'page_view', 'section_view') THEN
    IF asset_type_val = 'pitch_deck' THEN delta_deck := 1; END IF;
    IF asset_type_val = 'om'         THEN delta_om   := 1; END IF;
  ELSIF NEW.event_type IN ('data_room_login', 'data_room_file_view') THEN
    delta_data_room := 1;
  ELSIF NEW.event_type = 'email_open' THEN
    delta_open := 1;
  ELSIF NEW.event_type = 'link_click' THEN
    delta_click := 1;
  END IF;

  INSERT INTO engagement_rollups (
    pipeline_id, organization_id,
    deck_views, om_views, data_room_visits, email_opens, link_clicks,
    last_engagement_at, updated_at
  )
  VALUES (
    NEW.pipeline_id, NEW.organization_id,
    delta_deck, delta_om, delta_data_room, delta_open, delta_click,
    NEW.occurred_at, NOW()
  )
  ON CONFLICT (pipeline_id) DO UPDATE SET
    deck_views          = engagement_rollups.deck_views          + delta_deck,
    om_views            = engagement_rollups.om_views            + delta_om,
    data_room_visits    = engagement_rollups.data_room_visits    + delta_data_room,
    email_opens         = engagement_rollups.email_opens         + delta_open,
    link_clicks         = engagement_rollups.link_clicks         + delta_click,
    last_engagement_at  = NEW.occurred_at,
    updated_at          = NOW();

  -- Mirror to the per-investor timeline. Phase 2 already accepts
  -- 'engagement' as a valid event_type.
  pipeline_payload := jsonb_build_object(
    'engagement_event_id', NEW.id,
    'event_type',          NEW.event_type,
    'asset_type',          asset_type_val,
    'subtype',             NEW.event_subtype
  );
  INSERT INTO raise_pipeline_events (
    pipeline_id, organization_id, event_type, actor_id, payload, occurred_at
  )
  VALUES (
    NEW.pipeline_id, NEW.organization_id, 'engagement', NULL, pipeline_payload, NEW.occurred_at
  );

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_engagement_after_insert ON engagement_events;
CREATE TRIGGER trg_engagement_after_insert
  AFTER INSERT ON engagement_events
  FOR EACH ROW EXECUTE FUNCTION public.engagement_after_insert();

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE shared_assets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_rollups  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members read shared assets" ON shared_assets;
CREATE POLICY "Org members read shared assets"
  ON shared_assets FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members manage shared assets" ON shared_assets;
CREATE POLICY "Org members manage shared assets"
  ON shared_assets FOR ALL TO authenticated
  USING (organization_id = public.auth_user_org_id())
  WITH CHECK (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members read engagement events" ON engagement_events;
CREATE POLICY "Org members read engagement events"
  ON engagement_events FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

-- engagement_events writes happen via service role from public tracking
-- routes; no authenticated INSERT policy needed.

DROP POLICY IF EXISTS "Org members read rollups" ON engagement_rollups;
CREATE POLICY "Org members read rollups"
  ON engagement_rollups FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

-- ── Done. ────────────────────────────────────────────────────
-- Next ship: tokenized share endpoint + public /s/[token] viewer
-- + initial Kanban dot indicators reading from engagement_rollups.
