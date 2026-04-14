// Vercel cron invocations carry the `x-vercel-cron` header (stripped on
// external requests by Vercel's edge), so it's a trustworthy signal of a
// scheduled call. `Authorization: Bearer ${CRON_SECRET}` is still accepted
// for manual curl / external triggers when CRON_SECRET is configured.
export function isAuthorizedCron(request: Request): boolean {
  if (request.headers.get('x-vercel-cron')) return true;

  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}
