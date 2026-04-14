-- ============================================================
-- FCG Capital Intelligence Portal — Scrape Runs
-- Tracks every ingest attempt so Source Health can distinguish
-- "cron fired but dedup hit 100%" from "cron never ran".
-- Run in the Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS scrape_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  org_slug TEXT,
  items_ingested INT NOT NULL DEFAULT 0,
  items_skipped INT NOT NULL DEFAULT 0,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_scrape_runs_source_ran
  ON scrape_runs(source, ran_at DESC);

ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so no policies needed. Add a read policy
-- if we ever let authenticated clients query this directly.
