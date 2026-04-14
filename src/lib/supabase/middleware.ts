import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Per-isolate cache of in-flight / recently-completed session refreshes.
// Keyed by a signature of the incoming sb-* cookies so that two parallel
// requests from the same browser coalesce onto a single refresh call and
// both receive the same rotated tokens. Without this, concurrent requests
// each try to consume the same refresh_token, the second call fails with
// "Invalid Refresh Token: Already Used", and @supabase/ssr responds by
// clearing the session cookies — which logs the user out mid-page.
const refreshCache = new Map<string, { result: Promise<CookieToSet[]>; ts: number }>();
const REFRESH_CACHE_TTL_MS = 3000;

function sessionSignature(request: NextRequest): string {
  return request.cookies
    .getAll()
    .filter((c) => c.name.startsWith('sb-'))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => `${c.name}=${c.value}`)
    .join(';');
}

async function runRefresh(
  incomingCookies: { name: string; value: string }[],
): Promise<CookieToSet[]> {
  const collected: CookieToSet[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return incomingCookies;
        },
        setAll(cookiesToSet) {
          collected.push(...cookiesToSet);
        },
      },
    },
  );
  await supabase.auth.getUser();
  return collected;
}

export async function updateSession(request: NextRequest) {
  const sig = sessionSignature(request);

  if (!sig) {
    return NextResponse.next({ request });
  }

  const now = Date.now();
  for (const [key, entry] of refreshCache) {
    if (now - entry.ts > REFRESH_CACHE_TTL_MS) refreshCache.delete(key);
  }

  let entry = refreshCache.get(sig);
  if (!entry) {
    entry = { result: runRefresh(request.cookies.getAll()), ts: now };
    refreshCache.set(sig, entry);
  }

  const newCookies = await entry.result;

  for (const c of newCookies) {
    request.cookies.set(c.name, c.value);
  }
  const response = NextResponse.next({ request });
  for (const c of newCookies) {
    response.cookies.set(c.name, c.value, c.options);
  }
  return response;
}
