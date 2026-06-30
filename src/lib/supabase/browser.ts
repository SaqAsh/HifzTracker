'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabasePublishableKey, supabaseUrl } from '@/lib/env';
import type { Database } from '@/lib/database.types';

/** Creates a browser Supabase client using public env vars. */
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(supabaseUrl(), supabasePublishableKey());
}
