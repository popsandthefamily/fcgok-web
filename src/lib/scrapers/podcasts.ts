import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';
import type { OrgConfig, Industry } from '@/lib/config/industries';

// Industry-specific podcast RSS feeds
const PODCAST_FEEDS_BY_INDUSTRY: Record<Industry, { name: string; url: string }[]> = {
  'self-storage': [
    { name: 'Self Storage Investing', url: 'https://rss.buzzsprout.com/726468.rss' },
    { name: 'Storage Nerds', url: 'https://feeds.podetize.com/rss/SdiCXCOOT0' },
    { name: 'Self Storage Income', url: 'https://app.kajabi.com/podcasts/2147504576/feed' },
    { name: 'The Storage Investor Show', url: 'https://rss.buzzsprout.com/1332250.rss' },
  ],
  'multi-family': [
    { name: 'Multifamily Investing Podcast', url: 'https://feeds.buzzsprout.com/1007022.rss' },
  ],
  industrial: [],
  retail: [],
  office: [],
  hospitality: [],
  mixed: [],
};

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
  enclosure?: string;
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

    const enclosureMatch = block.match(/<enclosure[^>]*url="([^"]+)"/);

    items.push({
      title: get('title'),
      link: get('link'),
      description: get('description') || get('itunes:summary') || '',
      pubDate: get('pubDate'),
      author: get('itunes:author') || get('dc:creator') || undefined,
      enclosure: enclosureMatch?.[1],
    });
  }

  return items;
}

export async function ingestPodcasts(
  config: OrgConfig,
  orgSlug: string,
): Promise<{ ingested: number; skipped: number }> {
  const supabase = await createServiceClient();
  let ingested = 0;
  let skipped = 0;

  const feeds = PODCAST_FEEDS_BY_INDUSTRY[config.industry] ?? [];
  if (feeds.length === 0) return { ingested: 0, skipped: 0 };

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        next: { revalidate: 0 },
        headers: { 'User-Agent': 'FCGPortal/1.0' },
      });
      if (!res.ok) continue;

      const xml = await res.text();
      const items = parseRSSItems(xml);

      for (const item of items.slice(0, 10)) {
        if (!item.link) { skipped++; continue; }

        const hash = urlHash(item.link);
        const { data: existing } = await supabase
          .from('intel_items')
          .select('id')
          .eq('metadata->>url_hash', hash)
          .contains('client_visibility', [orgSlug])
          .limit(1);

        if (existing && existing.length > 0) { skipped++; continue; }

        const { error } = await supabase.from('intel_items').insert({
          source: 'podcast',
          source_url: item.link,
          title: `[${feed.name}] ${item.title}`,
          body: item.description.replace(/<[^>]*>/g, '').trim().slice(0, 3000),
          author: item.author || feed.name,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          client_visibility: [orgSlug],
          metadata: {
            url_hash: hash,
            podcast_name: feed.name,
            audio_url: item.enclosure,
          },
        });

        if (!error) ingested++;
        else skipped++;
      }
    } catch (err) {
      console.error(`Failed to fetch podcast feed ${feed.name}:`, err);
    }
  }

  return { ingested, skipped };
}
