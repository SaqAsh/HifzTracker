const DEFAULT_SITE_URL = 'http://localhost:3000';

/** Returns the value or throws a clear error when the variable is unset. */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/** Public Supabase project URL. */
export function supabaseUrl(): string {
  return required(
    'NEXT_PUBLIC_SUPABASE_URL',
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}

/** Public Supabase anon key. */
export function supabaseAnonKey(): string {
  return required(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Server-only Supabase service role key (bypasses RLS). */
export function supabaseServiceRoleKey(): string {
  return required(
    'SUPABASE_SERVICE_ROLE_KEY',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Public site URL used for auth redirects, defaulting to localhost. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}
