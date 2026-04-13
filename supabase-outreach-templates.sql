-- ============================================================
-- Outreach Templates + Send Tracking
-- Run in Supabase SQL Editor after supabase-schema.sql
-- Self-contained: (re)creates helper functions if missing.
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

CREATE TABLE IF NOT EXISTS outreach_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_seed BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_templates_org
  ON outreach_templates(organization_id);

CREATE TABLE IF NOT EXISTS outreach_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES outreach_templates(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT,
  recipient_name TEXT,
  subject_sent TEXT NOT NULL,
  body_sent TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  replied_at TIMESTAMPTZ,
  reply_status TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_outreach_sends_template
  ON outreach_sends(template_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sends_org
  ON outreach_sends(organization_id);

ALTER TABLE outreach_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members read templates" ON outreach_templates;
CREATE POLICY "Org members read templates"
  ON outreach_templates FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members manage templates" ON outreach_templates;
CREATE POLICY "Org members manage templates"
  ON outreach_templates FOR ALL TO authenticated
  USING (organization_id = public.auth_user_org_id())
  WITH CHECK (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members read sends" ON outreach_sends;
CREATE POLICY "Org members read sends"
  ON outreach_sends FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "Org members manage sends" ON outreach_sends;
CREATE POLICY "Org members manage sends"
  ON outreach_sends FOR ALL TO authenticated
  USING (organization_id = public.auth_user_org_id())
  WITH CHECK (organization_id = public.auth_user_org_id());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_outreach_template_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_outreach_templates_touch ON outreach_templates;
CREATE TRIGGER trg_outreach_templates_touch
  BEFORE UPDATE ON outreach_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_outreach_template_updated_at();
