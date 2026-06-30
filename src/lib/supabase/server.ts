import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  supabasePublishableKey,
  supabaseSecretKey,
  supabaseUrl,
} from '@/lib/env';
import type { Database } from '@/lib/database.types';

/** Creates a request-scoped Supabase client with SSR cookie support. */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; middleware refreshes sessions.
        }
      },
    },
  });
}

/** Creates a Supabase admin client using the service role key (no RLS). */
export function createAdminClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    supabaseUrl(),
    supabaseSecretKey(),
  );
}
