import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;

  // These portal routes don't require auth
  const publicPortalRoutes = ['/portal/login', '/portal/logout', '/portal/auth/callback'];
  const isPublicRoute = publicPortalRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Refresh the session — this reads auth cookies and refreshes if needed
  const { data: { session } } = await supabase.auth.getSession();

  // Protect /portal routes — redirect to login if not authenticated
  if (!session && pathname.startsWith('/portal')) {
    const url = request.nextUrl.clone();
    url.pathname = '/portal/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
