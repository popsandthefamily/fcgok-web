import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzeIntelItem } from '@/lib/ai/analyze-intel';
import type { OrgConfig } from '@/lib/config/industries';
import { isAuthorizedCron } from '@/lib/auth/cron-auth';

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    const { data: items, error: fetchError } = await supabase
      .from('intel_items')
      .select('*')
      .is('ai_analysis', null)
      .order('ingested_at', { ascending: true })
      .limit(5);

    if (fetchError) throw fetchError;
    if (!items || items.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, message: 'No items to process' });
    }

    // Cache org configs by slug to avoid repeated lookups
    const orgCache = new Map<string, OrgConfig>();

    async function getOrgConfig(slug: string): Promise<OrgConfig | null> {
      if (orgCache.has(slug)) return orgCache.get(slug)!;
      const { data } = await supabase
        .from('organizations')
        .select('settings')
        .eq('slug', slug)
        .single();
      const config = data?.settings as OrgConfig | null;
      if (config) orgCache.set(slug, config);
      return config;
    }

    const results: Array<{ id: string; status: string; error?: string }> = [];
    let processed = 0;
    let errors = 0;

    for (const item of items) {
      try {
        // Determine which org this item belongs to
        const visibility = (item.client_visibility as string[]) ?? ['all'];
        const orgSlug = visibility.find((v) => v !== 'all');
        const orgConfig = orgSlug ? await getOrgConfig(orgSlug) : null;

        const orgContext = orgConfig
          ? {
              industry: orgConfig.industry,
              primary_role: orgConfig.primary_role,
              keywords: orgConfig.intel.keywords,
            }
          : undefined;

        const analysis = await analyzeIntelItem(
          {
            title: item.title,
            body: item.body,
            source: item.source,
            author: item.author,
          },
          orgContext,
        );

        await supabase
          .from('intel_items')
          .update({
            summary: analysis.summary,
            ai_analysis: analysis,
            relevance_score: analysis.relevance_score,
            category: analysis.category,
            entities: analysis.entities,
            tags: analysis.tags,
          })
          .eq('id', item.id);

        processed++;
        results.push({ id: item.id, status: 'ok' });
      } catch (err) {
        console.error(`Failed to analyze item ${item.id}:`, err);
        errors++;
        results.push({
          id: item.id,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({ ok: true, processed, errors, results });
  } catch (error) {
    console.error('Process intel failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
