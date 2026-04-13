-- Fix infinite recursion in RLS policies caused by policies on user_profiles
-- and other tables querying user_profiles inside their own USING clauses.
--
-- The original "Users see own profile" policy did:
--   USING (id = auth.uid() OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin')
-- which re-enters the same policy when evaluating the subquery → recursion.
--
-- Fix: move the lookup into SECURITY DEFINER helper functions that bypass
-- RLS, then rewrite every policy that referenced user_profiles inline to
-- call those helpers instead.

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.auth_user_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM user_profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.auth_user_org_slug()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.slug
  FROM organizations o
  JOIN user_profiles p ON p.organization_id = o.id
  WHERE p.id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_org_slug() TO authenticated;

-- ── user_profiles ────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see own profile" ON user_profiles;
CREATE POLICY "Users see own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.auth_user_role() = 'admin'
  );

-- ── intel_items ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see items visible to their org or all" ON intel_items;
CREATE POLICY "Users see items visible to their org or all"
  ON intel_items FOR SELECT TO authenticated
  USING (
    'all' = ANY(client_visibility)
    OR public.auth_user_org_slug() = ANY(client_visibility)
  );

DROP POLICY IF EXISTS "Admins manage intel items" ON intel_items;
CREATE POLICY "Admins manage intel items"
  ON intel_items FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- ── tracked_entities ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins manage entities" ON tracked_entities;
CREATE POLICY "Admins manage entities"
  ON tracked_entities FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- ── entity_intel_links ───────────────────────────────────────
DROP POLICY IF EXISTS "Admins manage entity links" ON entity_intel_links;
CREATE POLICY "Admins manage entity links"
  ON entity_intel_links FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- ── organizations ────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see own org" ON organizations;
CREATE POLICY "Users see own org"
  ON organizations FOR SELECT TO authenticated
  USING (
    id = public.auth_user_org_id()
    OR public.auth_user_role() = 'admin'
  );

-- ── weekly_digests ───────────────────────────────────────────
DROP POLICY IF EXISTS "Admins manage digests" ON weekly_digests;
CREATE POLICY "Admins manage digests"
  ON weekly_digests FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');
