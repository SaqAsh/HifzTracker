'use client';

import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import { useId, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { fieldClassName } from '@/components/forms';
import { useDateTimePicker } from '@/hooks/use-date-time-picker';
import { formatDate, formatTime } from '@/lib/dates';

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

/** Themed date/time picker using the shadcn-style Popover + Calendar shape. */
export function DateTimePicker({
  defaultValue,
  name,
}: DateTimePickerProps): React.JSX.Element {
  const { date, setDate, setTime, time, value } =
    useDateTimePicker(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const labelId = useId();

  return (
    <div>
      <input name={name} type="hidden" value={value} />
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger
          aria-labelledby={labelId}
          className={clsx(
            fieldClassName,
            'flex items-center justify-between gap-3 text-left font-semibold text-teal',
          )}
          type="button"
        >
          <span id={labelId} className="min-w-0 truncate">
            {formatDate(value.slice(0, 10))} · {formatTime(value)}
          </span>
          <svg
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-sand"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            avoidCollisions
            className={clsx(
              'z-50 grid max-w-[calc(100vw-2rem)] gap-3 rounded-[2rem]',
              'border border-teal/15 bg-cream p-3 text-ink shadow-xl shadow-teal/10',
            )}
            collisionPadding={12}
            sideOffset={8}
          >
            <DayPicker
              classNames={DAY_PICKER_CLASS_NAMES}
              defaultMonth={date}
              mode="single"
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              selected={date}
            />

            <label className="grid gap-2 border-t border-teal/10 pt-3">
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

            <button
              className="tap-target rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream transition hover:bg-teal/90"
              onClick={() => {
                setIsOpen(false);
              }}
              type="button"
            >
              Done
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
