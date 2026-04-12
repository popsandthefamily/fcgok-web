import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';

const SUBREDDITS = [
  'selfstorage',
  'commercialrealestate',
  'realestateinvesting',
  'SelfStorageInvesting',
  'syndication',
];

const KEYWORDS = [
  'self storage', 'self-storage', 'capital raise', 'LP', 'GP',
  'syndication', '1031', 'opportunity zone', 'ground-up development',
  'construction loan',
];

interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  author: string;
  created_utc: number;
  subreddit: string;
  score: number;
}

async function getRedditToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Reddit credentials not set');

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'FCGPortal/1.0',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  return data.access_token;
}

export async function ingestReddit(): Promise<{ ingested: number; skipped: number }> {
  const token = await getRedditToken();
  const supabase = await createServiceClient();
  let ingested = 0;
  let skipped = 0;

  for (const sub of SUBREDDITS) {
    const res = await fetch(`https://oauth.reddit.com/r/${sub}/new?limit=25`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'FCGPortal/1.0',
      },
    });

    if (!res.ok) continue;
    const json = await res.json();
    const posts: RedditPost[] = (json.data?.children ?? []).map(
      (c: { data: RedditPost }) => c.data,
    );

    for (const post of posts) {
      const fullText = `${post.title} ${post.selftext}`.toLowerCase();
      const isRelevant = KEYWORDS.some((kw) => fullText.includes(kw.toLowerCase()));
      if (!isRelevant) { skipped++; continue; }

      const postUrl = `https://reddit.com${post.permalink}`;
      const hash = urlHash(postUrl);

      const { data: existing } = await supabase
        .from('intel_items')
        .select('id')
        .eq('metadata->>url_hash', hash)
        .limit(1);

      if (existing && existing.length > 0) { skipped++; continue; }

      const { error } = await supabase.from('intel_items').insert({
        source: 'reddit',
        source_url: postUrl,
        title: post.title,
        body: post.selftext?.slice(0, 5000) || null,
        author: post.author,
        published_at: new Date(post.created_utc * 1000).toISOString(),
        metadata: {
          url_hash: hash,
          subreddit: post.subreddit,
          score: post.score,
        },
      });

      if (!error) ingested++;
      else skipped++;
    }
  }

  return { ingested, skipped };
}
