import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';
import type { OrgConfig } from '@/lib/config/industries';

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

// Ingests all RSS feeds configured for the org (including industry presets
// like Inside Self-Storage). The feed label is stored in metadata.
export async function ingestRSS(
  config: OrgConfig,
  orgSlug: string,
): Promise<{ ingested: number; skipped: number }> {
  const feeds = config.custom_rss_feeds ?? [];
  if (feeds.length === 0) return { ingested: 0, skipped: 0 };

  const supabase = await createServiceClient();
  let ingested = 0;
  let skipped = 0;

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        next: { revalidate: 0 },
        headers: { 'User-Agent': 'FCGPortal/1.0' },
      });
      if (!res.ok) continue;

      const xml = await res.text();
      const items = parseRSSItems(xml);

      for (const item of items) {
        if (!item.link) { skipped++; continue; }

        const hash = urlHash(item.link);
        const { data: existing } = await supabase
          .from('intel_items')
          .select('id')
          .eq('metadata->>url_hash', hash)
          .contains('client_visibility', [orgSlug])
          .limit(1);

        if (existing && existing.length > 0) { skipped++; continue; }

        // Classify by industry: self-storage feeds → 'iss' source, otherwise 'news'
        const source = feed.url.includes('insideselfstorage') ? 'iss' : 'news';

        const { error } = await supabase.from('intel_items').insert({
          source,
          source_url: item.link,
          title: item.title,
          body: item.description.replace(/<[^>]*>/g, '').trim(),
          author: item.author || feed.name,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          client_visibility: [orgSlug],
          metadata: {
            url_hash: hash,
            feed_name: feed.name,
          },
        });

        if (!error) ingested++;
        else skipped++;
      }
    } catch (err) {
      console.error(`Failed to fetch RSS feed ${feed.name}:`, err);
    }
  }

  return { ingested, skipped };
}

// Keep the legacy ingestISS export for the existing cron endpoint
// (calls ingestRSS under the hood with just the ISS feed)
export async function ingestISS(): Promise<{ ingested: number; skipped: number }> {
  const supabase = await createServiceClient();
  const { data: orgs } = await supabase
    .from('organizations')
    .select('slug, settings')
    .filter('settings->>onboarding_completed', 'eq', 'true');

  let totalIngested = 0;
  let totalSkipped = 0;

  for (const org of orgs ?? []) {
    const config = org.settings as OrgConfig;
    if (!config.sources?.iss) continue;
    const result = await ingestRSS(config, org.slug);
    totalIngested += result.ingested;
    totalSkipped += result.skipped;
  }

  return { ingested: totalIngested, skipped: totalSkipped };
}
