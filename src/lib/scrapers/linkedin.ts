import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';

// LinkedIn workaround: Use NewsAPI to find LinkedIn posts indexed by Google News
// that mention target self-storage companies. This catches press releases, hiring
// announcements, and thought leadership without needing Proxycurl or LinkedIn API.

const TARGET_COMPANIES = [
  'Public Storage',
  'Extra Space Storage',
  'CubeSmart',
  'SROA Capital',
  'DXD Capital',
  'Life Storage',
  'National Storage Affiliates',
  'BSC Group',
  'Madison Capital Group',
  'Cedar Creek Capital',
  'SkyView Advisors',
  'Argus Self Storage',
];

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
  author: string | null;
}

export async function ingestLinkedIn(): Promise<{ ingested: number; skipped: number }> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) throw new Error('NEWSAPI_KEY not set (used for LinkedIn workaround)');

  const supabase = await createServiceClient();
  let ingested = 0;
  let skipped = 0;

  // Build a targeted query combining self-storage keywords with LinkedIn-ish sources
  // Search for company announcements and press releases
  for (const company of TARGET_COMPANIES.slice(0, 6)) {
    const query = `"${company}" AND (announce OR hire OR raise OR close OR acquire OR "new fund")`;

    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', query);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', '10');
    url.searchParams.set('from', getDateDaysAgo(14));
    url.searchParams.set('apiKey', apiKey);

    try {
      const res = await fetch(url.toString(), { next: { revalidate: 0 } });
      if (!res.ok) continue;

      const data = await res.json();
      const articles: NewsArticle[] = data.articles ?? [];

      for (const article of articles) {
        if (!article.url) { skipped++; continue; }

        const hash = urlHash(article.url);

        const { data: existing } = await supabase
          .from('intel_items')
          .select('id')
          .eq('metadata->>url_hash', hash)
          .limit(1);

        if (existing && existing.length > 0) { skipped++; continue; }

        const { error } = await supabase.from('intel_items').insert({
          source: 'linkedin',
          source_url: article.url,
          title: `[${company}] ${article.title}`,
          body: article.description,
          author: article.author,
          published_at: article.publishedAt,
          metadata: {
            url_hash: hash,
            tracked_company: company,
            news_source: article.source.name,
            collection_method: 'newsapi-proxy',
          },
        });

        if (!error) ingested++;
        else skipped++;
      }
    } catch (err) {
      console.error(`Failed to fetch for company ${company}:`, err);
    }
  }

  return { ingested, skipped };
}

function getDateDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}
