import type {
  PostgrestError,
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';

/** Throws when a mutation returned a Postgrest error. */
export function expectOk(result: { error: PostgrestError | null }): void {
  if (result.error) {
    throw new Error(result.error.message);
  }
}

/** Returns the rows from a list query, or throws on error. */
export function unwrapList<T>(result: PostgrestResponse<T>): T[] {
  expectOk(result);
  return result.data ?? [];
}

/** Returns an optional single row, or throws on error. */
export function unwrapMaybe<T>(
  result: PostgrestMaybeSingleResponse<T>,
): null | T {
  expectOk(result);
  return result.data;
}

/** Returns a required single row, or throws on error/absence. */
export function unwrapSingle<T>(result: PostgrestSingleResponse<T>): T {
  expectOk(result);

  if (result.data === null) {
    throw new Error('Expected a single row but found none');
  }

  return result.data;
}
