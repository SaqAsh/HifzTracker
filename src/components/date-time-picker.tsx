'use client';

import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import { useId } from 'react';
import { DayPicker } from 'react-day-picker';
import { fieldClassName } from '@/components/forms';
import { useDateTimePicker } from '@/hooks/use-date-time-picker';
import { formatDate } from '@/lib/dates';

type DateTimePickerProps = {
  defaultValue: string;
  name: string;
};

const DAY_PICKER_CLASS_NAMES = {
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
};

/** Mobile-safe date/time picker backed by a hidden form field. */
export function DateTimePicker({
  defaultValue,
  name,
}: DateTimePickerProps): React.JSX.Element {
  const { date, setDate, setTime, time, value } =
    useDateTimePicker(defaultValue);
  const labelId = useId();

  return (
    <div className="grid gap-3">
      <input name={name} type="hidden" value={value} />
      <Popover.Root>
        <Popover.Trigger
          aria-labelledby={labelId}
          className={clsx(
            fieldClassName,
            'flex items-center justify-between text-left font-semibold text-teal',
          )}
          type="button"
        >
          <span id={labelId}>{formatDate(value.slice(0, 10))}</span>
          <span aria-hidden="true" className="text-sand">
            Pick date
          </span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            avoidCollisions
            className={clsx(
              'z-50 max-w-[calc(100vw-2rem)] rounded-[2rem]',
              'border border-teal/15 bg-cream p-3 shadow-xl shadow-teal/10',
            )}
            collisionPadding={12}
            sideOffset={8}
          >
            <DayPicker
              classNames={DAY_PICKER_CLASS_NAMES}
              mode="single"
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              selected={date}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-teal">Time</span>
        <input
          className={fieldClassName}
          onChange={(event) => {
            setTime(event.target.value);
          }}
          required
          type="time"
          value={time}
        />
      </label>
    </div>
  );
}
