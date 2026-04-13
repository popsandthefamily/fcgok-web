import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on portal pages AND API routes so Supabase session cookies refresh
  // on every request. Excludes /api/cron (uses CRON_SECRET, no cookies).
  matcher: ['/portal/:path*', '/api/((?!cron/).*)'],
};
