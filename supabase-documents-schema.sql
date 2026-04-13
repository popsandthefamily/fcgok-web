-- ============================================================
-- Documents (OM / Prospectus / Pitch Deck) — Schema Addition
-- Run this AFTER supabase-schema.sql in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('om', 'prospectus', 'pitch_deck')),
  deal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'archived')),
  template TEXT DEFAULT 'modern',
  deal_facts JSONB DEFAULT '{}',      -- structured inputs from the form
  sections JSONB DEFAULT '[]',         -- generated section content array
  cover_image_url TEXT,
  settings JSONB DEFAULT '{}',         -- per-doc settings (page break prefs, etc)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can see documents in their org (service client bypasses RLS for API routes)
CREATE POLICY "Users see own org documents"
  ON documents FOR SELECT TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

-- Auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_updated_at ON documents;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();
