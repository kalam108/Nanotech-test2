import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isSuperAdminRoute =
    pathname === '/super-admin' ||
    pathname.startsWith('/super-admin/') ||
    pathname === '/superadmin' ||
    pathname.startsWith('/superadmin/');

  // Only guard /admin and /super-admin
  if (!isAdminRoute && !isSuperAdminRoute) {
    return response;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://zovjbvddiimvxragxxni.supabase.co';

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_eruSA7SXKOr6YmrDXkZQKA_e77938Pk';

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  let user = null;
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch (err) {
    console.warn('Middleware auth check notice:', err);
  }

  // Read role from profiles table or cookies
  let role = 'guest';
  const roleCookie = request.cookies.get('nanotech_role')?.value;

  if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role.toLowerCase();
      } else if (roleCookie) {
        role = roleCookie.toLowerCase();
      } else if (user.user_metadata?.role) {
        role = String(user.user_metadata.role).toLowerCase();
      }
    } catch {
      if (roleCookie) role = roleCookie.toLowerCase();
    }

    const email = user.email?.toLowerCase();
    if (email === 'kalamchy88@gmail.com' || email === 'nenotech108@gmail.com') {
      role = 'super_admin';
    }
  } else if (roleCookie) {
    role = roleCookie.toLowerCase();
  }

  const isSuperAdmin = role === 'super_admin' || role === 'superadmin';
  const isAdmin = role === 'admin' || isSuperAdmin;

  // 1. /super-admin is accessible ONLY to super_admin. Anyone else redirected to homepage.
  if (isSuperAdminRoute) {
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // 2. /admin is accessible ONLY to admin and super_admin. Anyone else redirected to homepage.
  if (isAdminRoute) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/super-admin',
    '/super-admin/:path*',
    '/superadmin',
    '/superadmin/:path*',
  ],
};
