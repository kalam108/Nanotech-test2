import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl =
    (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
    'https://zovjbvddiimvxragxxni.supabase.co';

  const supabaseKey =
    (typeof process !== 'undefined' &&
      (process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env?.SUPABASE_ANON_KEY)) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    'sb_publishable_eruSA7SXKOr6YmrDXkZQKA_e77938Pk';

  return createBrowserClient(supabaseUrl, supabaseKey);
}

export const supabase = createClient();
