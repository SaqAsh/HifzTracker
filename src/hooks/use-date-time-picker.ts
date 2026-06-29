'use client';

import { useMemo, useState } from 'react';
import { combineDateAndTime, parseDateTimeParts } from '@/lib/dates';

type UseDateTimePicker = {
  date: Date;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;
  time: string;
  value: string;
};

/** Manages the date and time halves of a datetime-local form field. */
export function useDateTimePicker(defaultValue: string): UseDateTimePicker {
  const parsed = useMemo(
    () => parseDateTimeParts(defaultValue),
    [defaultValue],
  );
  const [date, setDate] = useState<Date>(parsed.date);
  const [time, setTime] = useState(parsed.time);

  return {
    date,
    setDate,
    setTime,
    time,
    value: combineDateAndTime(date, time),
  };
}
