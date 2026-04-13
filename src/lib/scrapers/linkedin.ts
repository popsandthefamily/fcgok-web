import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';
import type { OrgConfig } from '@/lib/config/industries';

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
  author: string | null;
}

// LinkedIn workaround: use NewsAPI to find press-release style coverage
// that mentions the org's target companies. Catches announcements, hires,
// and fund raises without needing the Proxycurl API.
export async function ingestLinkedIn(
  config: OrgConfig,
  orgSlug: string,
): Promise<{ ingested: number; skipped: number }> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) throw new Error('NEWSAPI_KEY not set (required for LinkedIn workaround)');

  const companies = config.intel.target_companies.slice(0, 6); // Rate-limit the fanout
  if (companies.length === 0) return { ingested: 0, skipped: 0 };

  const supabase = await createServiceClient();
  let ingested = 0;
  let skipped = 0;

  for (const company of companies) {
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
          .contains('client_visibility', [orgSlug])
          .limit(1);

        if (existing && existing.length > 0) { skipped++; continue; }

        const { error } = await supabase.from('intel_items').insert({
          source: 'linkedin',
          source_url: article.url,
          title: `[${company}] ${article.title}`,
          body: article.description,
          author: article.author,
          published_at: article.publishedAt,
          client_visibility: [orgSlug],
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
