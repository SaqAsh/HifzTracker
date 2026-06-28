const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeStyle: 'short',
});

/** Formats an ISO date/time for compact app display. */
export function formatDateTime(value: string): string {
  return DATE_TIME_FORMATTER.format(new Date(value));
}

/** Formats an ISO date for compact app display. */
export function formatDate(value: string): string {
  return DATE_FORMATTER.format(new Date(`${value}T00:00:00`));
}

/** Formats only the local time portion of an ISO date/time. */
export function formatTime(value: string): string {
  return TIME_FORMATTER.format(new Date(value));
}

/** Returns whole days elapsed since a yyyy-mm-dd date. */
export function daysSince(dateValue: string): number {
  const start = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.max(
    0,
    Math.floor((todayMidnight.getTime() - start.getTime()) / 86_400_000),
  );
}

/** Returns a friendly duration between ISO timestamps. */
export function formatDuration(
  startedAt: string,
  endedAt: null | string,
): string {
  const end = endedAt ? new Date(endedAt) : new Date();
  const minutes = Math.max(
    0,
    Math.round((end.getTime() - new Date(startedAt).getTime()) / 60_000),
  );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes === 0
    ? `${hours} hr`
    : `${hours} hr ${remainingMinutes} min`;
}

/** Converts a Date into the value expected by datetime-local inputs. */
export function toDateTimeLocalValue(date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
