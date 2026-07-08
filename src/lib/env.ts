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

/** Public Supabase publishable key (safe for the browser). */
export function supabasePublishableKey(): string {
  return required(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** Server-only Supabase secret key (bypasses RLS). */
export function supabaseSecretKey(): string {
  return required(
    'SUPABASE_SECRET_KEY',
    process.env.SUPABASE_SECRET_KEY,
  );
}

/** Public site URL used for generated metadata, defaulting to localhost. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}
