import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

/** Request-scoped Supabase client typed against the app schema. */
export type DbClient = SupabaseClient<Database>;
