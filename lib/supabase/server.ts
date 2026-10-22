import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function createClient(cookieStore?: any) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://zovjbvddiimvxragxxni.supabase.co';

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_eruSA7SXKOr6YmrDXkZQKA_e77938Pk';

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore?.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore?.set({ name, value, ...options });
        } catch {
          // Can be ignored if called from Server Component
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore?.set({ name, value: '', ...options });
        } catch {
          // Can be ignored if called from Server Component
        }
      },
    },
  });
}
