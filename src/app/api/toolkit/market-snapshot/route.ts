import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'No AI provider configured.' }, { status: 503 });
  }

  const body = await request.json();
  const location: string | undefined = body.location?.trim();
  const assetType: string | undefined = body.assetType?.trim();
  const keywords: string[] | undefined = body.keywords;

  if (!location) return NextResponse.json({ error: 'Location is required' }, { status: 400 });

  try {
    const service = await createServiceClient();

    // Resolve the org's configured industry as fallback asset type
    let resolvedAssetType = assetType;
    if (!resolvedAssetType) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await service
          .from('user_profiles')
          .select('organizations(settings)')
          .eq('id', user.id)
          .maybeSingle();
        const org = profile?.organizations as { settings?: { industry?: string } } | null;
        if (org?.settings?.industry) {
          resolvedAssetType = org.settings.industry.replace(/-/g, ' ');
        }
      }
    }

    // Fetch related intel — match on location AND optional keywords
    const searchTerms = [location, ...(keywords ?? [])];
    const orClauses = searchTerms
      .map((t) => `title.ilike.%${t}%,summary.ilike.%${t}%`)
      .join(',');

    const { data: relatedIntel } = await service
      .from('intel_items')
      .select('summary')
      .or(orClauses)
      .not('summary', 'is', null)
      .order('relevance_score', { ascending: false })
      .limit(15);

    const recentIntel = relatedIntel?.map((i) => i.summary).filter(Boolean) as string[] ?? [];

    const { generateMarketSnapshot } = await import('@/lib/ai/generate-snapshot');
    const result = await generateMarketSnapshot(location, recentIntel, resolvedAssetType, keywords);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Market snapshot error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate snapshot.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
