-- ============================================================
-- FCG Capital Intelligence Portal — Database Schema
-- Run this in the Supabase SQL Editor to initialize the database
-- ============================================================

-- ── Intel Items ──────────────────────────────────────────────
CREATE TABLE intel_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  source_url TEXT,
  title TEXT NOT NULL,
  body TEXT,
  summary TEXT,
  ai_analysis JSONB,
  author TEXT,
  published_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT,
  relevance_score FLOAT,
  entities JSONB,
  tags TEXT[],
  is_curated BOOLEAN DEFAULT FALSE,
  client_visibility TEXT[] DEFAULT '{all}',
  metadata JSONB
);

CREATE INDEX idx_intel_items_fts ON intel_items
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, '') || ' ' || coalesce(summary, '')));
CREATE INDEX idx_intel_items_source ON intel_items(source);
CREATE INDEX idx_intel_items_category ON intel_items(category);
CREATE INDEX idx_intel_items_published ON intel_items(published_at DESC);
CREATE INDEX idx_intel_items_relevance ON intel_items(relevance_score DESC);
CREATE INDEX idx_intel_items_curated ON intel_items(is_curated) WHERE is_curated = TRUE;

-- ── Tracked Entities ─────────────────────────────────────────
CREATE TABLE tracked_entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  description TEXT,
  linkedin_url TEXT,
  website TEXT,
  categories TEXT[],
  geography TEXT[],
  deal_size_min BIGINT,
  deal_size_max BIGINT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  last_activity_at TIMESTAMPTZ,
  activity_count INT DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Entity-Intel Links ───────────────────────────────────────
CREATE TABLE entity_intel_links (
  entity_id UUID REFERENCES tracked_entities(id) ON DELETE CASCADE,
  intel_item_id UUID REFERENCES intel_items(id) ON DELETE CASCADE,
  relationship TEXT,
  PRIMARY KEY (entity_id, intel_item_id)
);

-- ── Organizations ────────────────────────────────────────────
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'standard',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── User Profiles ────────────────────────────────────────────
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  organization_id UUID REFERENCES organizations(id),
  role TEXT DEFAULT 'viewer',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Portal Events ────────────────────────────────────────────
CREATE TABLE portal_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  intel_item_id UUID REFERENCES intel_items(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Weekly Digests ───────────────────────────────────────────
CREATE TABLE weekly_digests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start TIMESTAMPTZ NOT NULL,
  week_end TIMESTAMPTZ NOT NULL,
  content TEXT NOT NULL,
  item_count INT DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE intel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_intel_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;

-- Intel items: visible to all authenticated users (scoped by client_visibility)
CREATE POLICY "Users see items visible to their org or all"
  ON intel_items FOR SELECT TO authenticated
  USING (
    'all' = ANY(client_visibility)
    OR (
      SELECT slug FROM organizations
      WHERE id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    ) = ANY(client_visibility)
  );

-- Admin can insert/update/delete intel items
CREATE POLICY "Admins manage intel items"
  ON intel_items FOR ALL TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Tracked entities: all authenticated can read
CREATE POLICY "All authenticated read entities"
  ON tracked_entities FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage entities"
  ON tracked_entities FOR ALL TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Entity links: all authenticated can read
CREATE POLICY "All authenticated read entity links"
  ON entity_intel_links FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage entity links"
  ON entity_intel_links FOR ALL TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Organizations: users see their own org
CREATE POLICY "Users see own org"
  ON organizations FOR SELECT TO authenticated
  USING (
    id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- User profiles: users see own profile, admins see all
CREATE POLICY "Users see own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Portal events: users see own events
CREATE POLICY "Users see own events"
  ON portal_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own events"
  ON portal_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Digests: all authenticated can read
CREATE POLICY "All authenticated read digests"
  ON weekly_digests FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage digests"
  ON weekly_digests FOR ALL TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- ── Seed: FCG org + Hunter as admin ──────────────────────────
-- Run this after creating Hunter's auth user in Supabase dashboard:
--
-- INSERT INTO organizations (name, slug, subscription_tier)
-- VALUES ('Frontier Consulting Group', 'fcg', 'premium');
--
-- INSERT INTO user_profiles (id, email, full_name, organization_id, role)
-- VALUES (
--   '<hunter-auth-user-id>',
--   'info@fcgok.com',
--   'Hunter Collins',
--   (SELECT id FROM organizations WHERE slug = 'fcg'),
--   'admin'
-- );
