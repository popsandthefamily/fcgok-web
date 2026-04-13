-- ============================================================
-- FCG Capital Intelligence Portal — Invitations
-- Run in the Supabase SQL Editor after supabase-schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(lower(email));
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Admins (via SECURITY DEFINER helper that bypasses RLS) can fully manage invites.
-- All server-side invite work goes through the service role anyway, which bypasses
-- these policies; the policies exist so an authenticated admin client could read
-- invite state if we ever add a UI for it.
DROP POLICY IF EXISTS "Admins manage invitations" ON invitations;
CREATE POLICY "Admins manage invitations"
  ON invitations FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');
