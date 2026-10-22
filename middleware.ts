import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: any) {
  let response = request;

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
        return request.cookies?.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies?.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies?.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Refresh auth session
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
