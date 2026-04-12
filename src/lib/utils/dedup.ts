import { createHash } from 'crypto';

export function urlHash(url: string): string {
  return createHash('sha256').update(url.trim().toLowerCase()).digest('hex');
}

export function contentHash(title: string, body: string | null): string {
  const input = `${title.trim().toLowerCase()}::${(body ?? '').trim().toLowerCase().slice(0, 500)}`;
  return createHash('sha256').update(input).digest('hex');
}
