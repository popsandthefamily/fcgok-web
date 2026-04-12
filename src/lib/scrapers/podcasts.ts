import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';

// Self-storage and CRE podcast RSS feeds
const PODCAST_FEEDS = [
  {
    name: 'The Storage Investor Show',
    url: 'https://feeds.buzzsprout.com/1867632.rss',
  },
  {
    name: 'Inside Self-Storage Podcast',
    url: 'https://feeds.megaphone.fm/ISS5123456789',
  },
  {
    name: 'Self Storage Income',
    url: 'https://feeds.captivate.fm/self-storage-income/',
  },
  {
    name: 'BiggerPockets Real Estate Podcast',
    url: 'https://feeds.simplecast.com/5Io7GCzb',
  },
];

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

const STORAGE_KEYWORDS = [
  'storage', 'self-storage', 'capital', 'fund', 'raise', 'investor',
  'syndication', 'cap rate', 'noi', 'lender', 'development',
];

export async function ingestPodcasts(): Promise<{ ingested: number; skipped: number }> {
  const supabase = await createServiceClient();
  let ingested = 0;
  let skipped = 0;

  for (const feed of PODCAST_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        next: { revalidate: 0 },
        headers: { 'User-Agent': 'FCGPortal/1.0' },
      });
      if (!res.ok) { continue; }

      const xml = await res.text();
      const items = parseRSSItems(xml);

      // Only keep last 10 episodes per feed
      for (const item of items.slice(0, 10)) {
        if (!item.link) { skipped++; continue; }

        // Filter for storage/capital relevance (skip if it's the general BP podcast)
        if (feed.name === 'BiggerPockets Real Estate Podcast') {
          const fullText = `${item.title} ${item.description}`.toLowerCase();
          if (!STORAGE_KEYWORDS.some((kw) => fullText.includes(kw))) {
            skipped++;
            continue;
          }
        }

        const hash = urlHash(item.link);

        const { data: existing } = await supabase
          .from('intel_items')
          .select('id')
          .eq('metadata->>url_hash', hash)
          .limit(1);

        if (existing && existing.length > 0) { skipped++; continue; }

        const { error } = await supabase.from('intel_items').insert({
          source: 'podcast',
          source_url: item.link,
          title: `[${feed.name}] ${item.title}`,
          body: item.description.replace(/<[^>]*>/g, '').trim().slice(0, 3000),
          author: item.author || feed.name,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
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
