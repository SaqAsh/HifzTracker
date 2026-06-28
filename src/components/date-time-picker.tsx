'use client';

import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import { useId, useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { fieldClassName } from '@/components/forms';
import { formatDate } from '@/lib/dates';

type DateTimePickerProps = {
  defaultValue: string;
  name: string;
};

function parseLocalValue(value: string): { date: Date; time: string } {
  const [datePart, timePart = '12:00'] = value.split('T');
  const date = datePart ? new Date(`${datePart}T00:00:00`) : new Date();

  return {
    date,
    time: timePart.slice(0, 5),
  };
}

function toLocalValue(date: Date, time: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T${time}`;
}

/** Mobile-safe date/time picker backed by a hidden form field. */
export function DateTimePicker({
  defaultValue,
  name,
}: DateTimePickerProps): React.JSX.Element {
  const parsed = useMemo(() => parseLocalValue(defaultValue), [defaultValue]);
  const [date, setDate] = useState<Date>(parsed.date);
  const [time, setTime] = useState(parsed.time);
  const labelId = useId();

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={toLocalValue(date, time)} />
      <Popover.Root>
        <Popover.Trigger
          aria-labelledby={labelId}
          className={clsx(
            fieldClassName,
            'flex items-center justify-between text-left font-semibold text-teal',
          )}
          type="button"
        >
          <span id={labelId}>
            {formatDate(toLocalValue(date, time).slice(0, 10))}
          </span>
          <span aria-hidden="true" className="text-sand">
            Pick date
          </span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            avoidCollisions
            collisionPadding={12}
            sideOffset={8}
            className={clsx(
              'z-50 max-w-[calc(100vw-2rem)] rounded-[2rem]',
              'border border-teal/15 bg-cream p-3 shadow-xl shadow-teal/10',
            )}
          >
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              classNames={{
                button_next:
                  'grid h-10 w-10 place-items-center rounded-full text-teal hover:bg-teal/10',
                button_previous:
                  'grid h-10 w-10 place-items-center rounded-full text-teal hover:bg-teal/10',
                caption_label: 'font-serif text-lg font-semibold text-teal',
                day: 'grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-ink hover:bg-sage/25',
                disabled: 'opacity-30',
                month: 'space-y-3',
                month_caption: 'flex items-center justify-center py-2',
                month_grid: 'border-separate border-spacing-1',
                months: 'w-full',
                nav: 'absolute inset-x-3 top-3 flex items-center justify-between',
                outside: 'text-ink/30',
                selected: 'bg-teal text-cream hover:bg-teal',
                today: 'text-maroon ring-1 ring-sand',
                weekday: 'h-8 text-xs font-bold uppercase text-sand',
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-teal">Time</span>
        <input
          className={fieldClassName}
          type="time"
          value={time}
          onChange={(event) => {
            setTime(event.target.value);
          }}
          required
        />
      </label>
    </div>
  );
}
