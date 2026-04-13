import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';
import type { OrgConfig } from '@/lib/config/industries';

const BP_BLOG_RSS = 'https://www.biggerpockets.com/blog/feed';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
  category?: string;
}

function parseRSSItems(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? (m[1] ?? m[2] ?? '').trim() : '';
    };

    items.push({
      title: get('title'),
      link: get('link'),
      description: get('description'),
      pubDate: get('pubDate'),
      author: get('dc:creator') || get('author') || undefined,
      category: get('category') || undefined,
    });
  }

  return items;
}

export async function ingestBiggerPockets(
  config: OrgConfig,
  orgSlug: string,
): Promise<{ ingested: number; skipped: number }> {
  const res = await fetch(BP_BLOG_RSS, {
    next: { revalidate: 0 },
    headers: { 'User-Agent': 'FCGPortal/1.0 (contact: info@fcgok.com)' },
  });
  if (!res.ok) throw new Error(`BiggerPockets RSS fetch failed: ${res.status}`);

  const xml = await res.text();
  const items = parseRSSItems(xml);
  const supabase = await createServiceClient();

  let ingested = 0;
  let skipped = 0;

  const keywords = config.intel.keywords.map((k) => k.toLowerCase());

  for (const item of items) {
    if (!item.link) { skipped++; continue; }

    const fullText = `${item.title} ${item.description}`.toLowerCase();
    const isRelevant = keywords.some((kw) => fullText.includes(kw));
    if (!isRelevant) { skipped++; continue; }

    const hash = urlHash(item.link);
    const { data: existing } = await supabase
      .from('intel_items')
      .select('id')
      .eq('metadata->>url_hash', hash)
      .contains('client_visibility', [orgSlug])
      .limit(1);

    if (existing && existing.length > 0) { skipped++; continue; }

    const { error } = await supabase.from('intel_items').insert({
      source: 'biggerpockets',
      source_url: item.link,
      title: item.title,
      body: item.description.replace(/<[^>]*>/g, '').trim(),
      author: item.author || null,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      client_visibility: [orgSlug],
      metadata: {
        url_hash: hash,
        category: item.category,
      },
    });

    if (!error) ingested++;
    else skipped++;
  }

  return { ingested, skipped };
}
