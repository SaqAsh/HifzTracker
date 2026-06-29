const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;
const MINUTES_PER_HOUR = 60;

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
    Math.floor((todayMidnight.getTime() - start.getTime()) / MS_PER_DAY),
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
    Math.round((end.getTime() - new Date(startedAt).getTime()) / MS_PER_MINUTE),
  );

  if (minutes < MINUTES_PER_HOUR) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainingMinutes = minutes % MINUTES_PER_HOUR;

  return remainingMinutes === 0
    ? `${hours} hr`
    : `${hours} hr ${remainingMinutes} min`;
}

/** Converts a Date into the value expected by datetime-local inputs. */
export function toDateTimeLocalValue(date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * MS_PER_MINUTE);
  return local.toISOString().slice(0, 16);
}

/** Splits a datetime-local string into a calendar date and HH:mm time. */
export function parseDateTimeParts(value: string): {
  date: Date;
  time: string;
} {
  const [datePart, timePart = '12:00'] = value.split('T');
  const date = datePart ? new Date(`${datePart}T00:00:00`) : new Date();

  return { date, time: timePart.slice(0, 5) };
}

/** Combines a calendar date and HH:mm time into a datetime-local string. */
export function combineDateAndTime(date: Date, time: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T${time}`;
}
