import { createServiceClient } from '@/lib/supabase/server';
import type { OrgConfig } from '@/lib/config/industries';

export interface OrgRecord {
  slug: string;
  name: string;
  settings: OrgConfig;
}

// Fetch all organizations that have completed onboarding
export async function getActiveOrgs(): Promise<OrgRecord[]> {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from('organizations')
    .select('slug, name, settings')
    .filter('settings->>onboarding_completed', 'eq', 'true');

  return ((data as OrgRecord[] | null) ?? []).filter((o) => !!o.settings);
}

export async function runForOrgs<T extends { ingested: number; skipped: number }>(
  sourceKey: keyof OrgConfig['sources'],
  scraper: (config: OrgConfig, orgSlug: string) => Promise<T>,
): Promise<{ ingested: number; skipped: number; perOrg: Record<string, T | { error: string }> }> {
  const orgs = await getActiveOrgs();
  let totalIngested = 0;
  let totalSkipped = 0;
  const perOrg: Record<string, T | { error: string }> = {};

  for (const org of orgs) {
    // Skip if this org has this source disabled
    if (!org.settings.sources?.[sourceKey]) continue;

    try {
      const result = await scraper(org.settings, org.slug);
      perOrg[org.slug] = result;
      totalIngested += result.ingested;
      totalSkipped += result.skipped;
    } catch (err) {
      perOrg[org.slug] = { error: err instanceof Error ? err.message : String(err) };
    }
  }

  return { ingested: totalIngested, skipped: totalSkipped, perOrg };
}
