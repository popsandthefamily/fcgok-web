-- ============================================================
-- Phase 2: Capital CRM — pipeline rows + activity timeline
-- Run in the Supabase Dashboard SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================
--
-- Adds the per-(raise, investor) pipeline model:
--   * raise_pipeline         — one row per (raise, investor); stage,
--                              assignee, next action, priority
--   * raise_pipeline_events  — append-only timeline (stage changes,
--                              notes, outreach, engagement signals
--                              from Phase 3)
--
-- ALTERs outreach_sends to link sends to a pipeline row, entity, and
-- raise (all nullable so legacy rows stay valid).
--
-- Triggers guarantee:
--   * updated_at + last_stage_change_at bookkeeping on UPDATE
--   * pipeline_added event on INSERT
--   * stage_change event on UPDATE when stage changes
--
-- Auto-fired events have actor_id = NULL. The app inserts events
-- with actor_id explicitly for note_added, task_added, outreach_sent,
-- and any other user-initiated event types.
-- ============================================================

CREATE OR REPLACE FUNCTION public.auth_user_org_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT organization_id FROM user_profiles WHERE id = auth.uid() $$;

GRANT EXECUTE ON FUNCTION public.auth_user_org_id() TO authenticated;

-- ── raise_pipeline ───────────────────────────────────────────
-- One row per (raise, investor). UNIQUE (raise_id, entity_id) so an
-- investor passing on Storage Fund III can still commit to Hospitality
-- Fund I — the two raises have separate rows.
CREATE TABLE IF NOT EXISTS raise_pipeline (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raise_id              UUID NOT NULL REFERENCES raises(id) ON DELETE CASCADE,
  entity_id             UUID NOT NULL REFERENCES tracked_entities(id) ON DELETE CASCADE,
  organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  stage                 TEXT NOT NULL DEFAULT 'identified'
    CHECK (stage IN (
      'identified',
      'researched',
      'intro_requested',
      'contacted',
      'nda_sent',
      'data_room_viewed',
      'diligence',
      'verbal_interest',
      'soft_circle',
      'committed',
      'passed'
    )),

  -- Commit / pass details
  committed_amount_usd  BIGINT,
  passed_reason         TEXT,

  -- Ownership + tasking (no separate tasks table; next_action lives here)
  assignee_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  next_action           TEXT,
  next_action_due_at    TIMESTAMPTZ,
  priority              TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high')),

  notes                 TEXT,

  added_at              TIMESTAMPTZ DEFAULT NOW(),
  last_stage_change_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (raise_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_pipeline_raise   ON raise_pipeline(raise_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_entity  ON raise_pipeline(entity_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_org     ON raise_pipeline(organization_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage   ON raise_pipeline(raise_id, stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_due
  ON raise_pipeline(next_action_due_at)
  WHERE next_action_due_at IS NOT NULL;

-- ── raise_pipeline_events ────────────────────────────────────
-- Append-only timeline. App-layer convention is "no UPDATE/DELETE";
-- RLS allows ALL for org members to keep flexibility (admins may
-- correct mistakes). Phase 3 will emit `engagement` events from the
-- engagement-tracking trigger.
CREATE TABLE IF NOT EXISTS raise_pipeline_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id     UUID NOT NULL REFERENCES raise_pipeline(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  event_type      TEXT NOT NULL CHECK (event_type IN (
    'pipeline_added',
    'stage_change',
    'note_added',
    'task_added',
    'task_completed',
    'outreach_sent',
    'outreach_replied',
    'document_shared',
    'engagement',
    'pipeline_removed'
  )),

  from_stage      TEXT,
  to_stage        TEXT,

  actor_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payload         JSONB DEFAULT '{}',

  occurred_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_pipeline
  ON raise_pipeline_events(pipeline_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_org
  ON raise_pipeline_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_type
  ON raise_pipeline_events(event_type);

-- ── outreach_sends links ─────────────────────────────────────
-- All nullable so existing rows stay valid; new sends initiated
-- from a pipeline card auto-fill these.
ALTER TABLE outreach_sends
  ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES raise_pipeline(id) ON DELETE SET NULL;
ALTER TABLE outreach_sends
  ADD COLUMN IF NOT EXISTS entity_id   UUID REFERENCES tracked_entities(id) ON DELETE SET NULL;
ALTER TABLE outreach_sends
  ADD COLUMN IF NOT EXISTS raise_id    UUID REFERENCES raises(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_outreach_sends_pipeline ON outreach_sends(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sends_entity   ON outreach_sends(entity_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sends_raise    ON outreach_sends(raise_id);

-- ── Triggers ─────────────────────────────────────────────────
-- BEFORE UPDATE: bump updated_at always; bump last_stage_change_at
-- when stage changes.
CREATE OR REPLACE FUNCTION public.raise_pipeline_before_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.last_stage_change_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pipeline_before_update ON raise_pipeline;
CREATE TRIGGER trg_pipeline_before_update
  BEFORE UPDATE ON raise_pipeline
  FOR EACH ROW EXECUTE FUNCTION public.raise_pipeline_before_update();

-- AFTER INSERT: emit a pipeline_added event so the timeline starts.
CREATE OR REPLACE FUNCTION public.raise_pipeline_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO raise_pipeline_events (
    pipeline_id, organization_id, event_type, to_stage, actor_id, payload
  )
  VALUES (NEW.id, NEW.organization_id, 'pipeline_added', NEW.stage, NULL, '{}'::jsonb);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_pipeline_after_insert ON raise_pipeline;
CREATE TRIGGER trg_pipeline_after_insert
  AFTER INSERT ON raise_pipeline
  FOR EACH ROW EXECUTE FUNCTION public.raise_pipeline_after_insert();

-- AFTER UPDATE: emit stage_change event when stage changed.
CREATE OR REPLACE FUNCTION public.raise_pipeline_after_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO raise_pipeline_events (
      pipeline_id, organization_id, event_type, from_stage, to_stage, actor_id, payload
    )
    VALUES (NEW.id, NEW.organization_id, 'stage_change', OLD.stage, NEW.stage, NULL, '{}'::jsonb);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_pipeline_after_update ON raise_pipeline;
CREATE TRIGGER trg_pipeline_after_update
  AFTER UPDATE ON raise_pipeline
  FOR EACH ROW EXECUTE FUNCTION public.raise_pipeline_after_update();

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE raise_pipeline        ENABLE ROW LEVEL SECURITY;
ALTER TABLE raise_pipeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members read pipeline" ON raise_pipeline;
CREATE POLICY "Org members read pipeline"
  ON raise_pipeline FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members manage pipeline" ON raise_pipeline;
CREATE POLICY "Org members manage pipeline"
  ON raise_pipeline FOR ALL TO authenticated
  USING (organization_id = public.auth_user_org_id())
  WITH CHECK (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members read pipeline events" ON raise_pipeline_events;
CREATE POLICY "Org members read pipeline events"
  ON raise_pipeline_events FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members manage pipeline events" ON raise_pipeline_events;
CREATE POLICY "Org members manage pipeline events"
  ON raise_pipeline_events FOR ALL TO authenticated
  USING (organization_id = public.auth_user_org_id())
  WITH CHECK (organization_id = public.auth_user_org_id());

-- Service role bypasses RLS (canonical app pattern).

-- ── Done. ────────────────────────────────────────────────────
-- Next ship: pipeline list view + "Add to pipeline" button on the
-- matches page. After that: Kanban + per-investor timeline detail.
