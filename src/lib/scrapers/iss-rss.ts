import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';

const ISS_RSS_URL = 'https://www.insideselfstorage.com/rss.xml';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
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
    });
  }

  return items;
}

export async function ingestISS(): Promise<{ ingested: number; skipped: number }> {
  const res = await fetch(ISS_RSS_URL, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`ISS RSS fetch failed: ${res.status}`);

  const xml = await res.text();
  const items = parseRSSItems(xml);
  const supabase = await createServiceClient();

  let ingested = 0;
  let skipped = 0;

  for (const item of items) {
    if (!item.link) { skipped++; continue; }

    const hash = urlHash(item.link);

    // Check for duplicate
    const { data: existing } = await supabase
      .from('intel_items')
      .select('id')
      .eq('metadata->>url_hash', hash)
      .limit(1);

    if (existing && existing.length > 0) { skipped++; continue; }

    const { error } = await supabase.from('intel_items').insert({
      source: 'iss',
      source_url: item.link,
      title: item.title,
      body: item.description.replace(/<[^>]*>/g, '').trim(),
      author: item.author || null,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      metadata: { url_hash: hash },
    });

    if (!error) ingested++;
    else skipped++;
  }

  return { ingested, skipped };
}
