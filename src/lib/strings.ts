/** Converts form string values into nullable text fields. */
export function nullableText(value: FormDataEntryValue | null): null | string {
  const text = typeof value === 'string' ? value.trim() : '';
  return text.length > 0 ? text : null;
}

/** Reads a required string from form data. */
export function requiredText(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value.trim();
}

/** Reads a positive integer from form data. */
export function positiveInteger(formData: FormData, key: string): number {
  const value = Number(requiredText(formData, key));

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${key} must be a positive integer`);
  }

  return value;
}
