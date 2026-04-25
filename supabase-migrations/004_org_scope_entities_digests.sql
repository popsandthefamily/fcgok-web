-- Add organization scoping for investor radar entities and weekly digests.
-- Run before deploying the corresponding portal/API code.

ALTER TABLE tracked_entities
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE weekly_digests
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tracked_entities_org ON tracked_entities(organization_id);
CREATE INDEX IF NOT EXISTS idx_weekly_digests_org ON weekly_digests(organization_id);

-- Best-effort backfill for legacy single-tenant data. If multiple orgs exist,
-- review and assign rows manually before making organization_id NOT NULL.
UPDATE tracked_entities
SET organization_id = (SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1)
WHERE organization_id IS NULL
  AND (SELECT COUNT(*) FROM organizations) = 1;

UPDATE weekly_digests
SET organization_id = (SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1)
WHERE organization_id IS NULL
  AND (SELECT COUNT(*) FROM organizations) = 1;

DROP POLICY IF EXISTS "All authenticated read entities" ON tracked_entities;
DROP POLICY IF EXISTS "Org members read entities" ON tracked_entities;
CREATE POLICY "Org members read entities"
  ON tracked_entities FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());

DROP POLICY IF EXISTS "All authenticated read entity links" ON entity_intel_links;
DROP POLICY IF EXISTS "Org members read entity links" ON entity_intel_links;
CREATE POLICY "Org members read entity links"
  ON entity_intel_links FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tracked_entities e
      WHERE e.id = entity_intel_links.entity_id
        AND e.organization_id = public.auth_user_org_id()
    )
  );

DROP POLICY IF EXISTS "All authenticated read digests" ON weekly_digests;
DROP POLICY IF EXISTS "Org members read digests" ON weekly_digests;
CREATE POLICY "Org members read digests"
  ON weekly_digests FOR SELECT TO authenticated
  USING (organization_id = public.auth_user_org_id());
