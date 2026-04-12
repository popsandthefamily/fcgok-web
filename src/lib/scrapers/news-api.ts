import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';

const KEYWORDS =
  '"self storage" AND (acquisition OR development OR fund OR capital OR investment OR REIT OR transaction OR construction OR lending)';

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
  author: string | null;
}

export async function ingestNews(): Promise<{ ingested: number; skipped: number }> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) throw new Error('NEWSAPI_KEY not set');

  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', KEYWORDS);
  url.searchParams.set('language', 'en');
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', '50');
  url.searchParams.set('apiKey', apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`NewsAPI fetch failed: ${res.status}`);

  const data = await res.json();
  const articles: NewsArticle[] = data.articles ?? [];
  const supabase = await createServiceClient();

  let ingested = 0;
  let skipped = 0;

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
      source: 'news',
      source_url: article.url,
      title: article.title,
      body: article.description,
      author: article.author,
      published_at: article.publishedAt,
      metadata: {
        url_hash: hash,
        source_name: article.source.name,
      },
    });

    if (!error) ingested++;
    else skipped++;
  }

  return { ingested, skipped };
}
