'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import {
  fieldClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from '@/components/forms';
import {
  combineDateAndTime,
  formatDate,
  formatTime,
  parseDateTimeParts,
} from '@/lib/dates';

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

/** Mobile-first date/time picker using a themed modal calendar sheet. */
export function DateTimePicker({
  defaultValue,
  name,
}: DateTimePickerProps): React.JSX.Element {
  const initialParts = useMemo(
    () => parseDateTimeParts(defaultValue),
    [defaultValue],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(initialParts.date);
  const [time, setTime] = useState(initialParts.time);
  const [draftDate, setDraftDate] = useState(initialParts.date);
  const [draftTime, setDraftTime] = useState(initialParts.time);
  const value = combineDateAndTime(date, time);
  const draftValue = combineDateAndTime(draftDate, draftTime);

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      setDraftDate(date);
      setDraftTime(time);
    }

    setIsOpen(nextOpen);
  }

  function saveDraft(): void {
    setDate(draftDate);
    setTime(draftTime);
    setIsOpen(false);
  }

  return (
    <div>
      <input name={name} type="hidden" value={value} />
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Trigger asChild>
          <button
            className={clsx(
              fieldClassName,
              'flex items-center justify-between gap-3 text-left font-semibold text-teal',
            )}
            type="button"
          >
            <span className="min-w-0 truncate">
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
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-teal/25 backdrop-blur-sm" />
          <Dialog.Content
            className={clsx(
              'fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50',
              'mx-auto grid max-h-[calc(100dvh-1.5rem)] gap-3 overflow-y-auto rounded-[2rem]',
              'border border-teal/15 bg-cream p-4 text-ink shadow-xl shadow-teal/15',
              'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(26rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-serif text-2xl font-semibold text-teal">
                  Pick Date & Time
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm font-semibold text-ink/60">
                  {formatDate(draftValue.slice(0, 10))} ·{' '}
                  {formatTime(draftValue)}
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Close date picker"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-teal/20 text-xl font-bold text-teal"
                type="button"
              >
                ×
              </Dialog.Close>
            </div>

            <DayPicker
              classNames={DAY_PICKER_CLASS_NAMES}
              defaultMonth={draftDate}
              mode="single"
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDraftDate(selectedDate);
                }
              }}
              selected={draftDate}
            />

            <label className="grid gap-2 border-t border-teal/10 pt-3">
              <span className="text-sm font-semibold text-teal">Time</span>
              <input
                className={fieldClassName}
                onChange={(event) => {
                  setDraftTime(event.target.value);
                }}
                required
                type="time"
                value={draftTime}
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <Dialog.Close className={secondaryButtonClassName} type="button">
                Cancel
              </Dialog.Close>
              <button
                className={primaryButtonClassName}
                onClick={saveDraft}
                type="button"
              >
                Done
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
