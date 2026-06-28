'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { clsx } from 'clsx';
import { useState } from 'react';

type SelectOption = {
  label: string;
  value: string;
};

type UiSelectProps = {
  defaultValue?: string;
  name: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
};

/** Form-compatible Radix select styled to match the app palette. */
export function UiSelect({
  defaultValue,
  name,
  onValueChange,
  options,
  placeholder = 'Choose one',
  value,
}: UiSelectProps): React.JSX.Element {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const selectedValue = value ?? internalValue;

  function handleValueChange(nextValue: string): void {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <SelectPrimitive.Root
      value={selectedValue}
      onValueChange={handleValueChange}
    >
      <input type="hidden" name={name} value={selectedValue} />
      <SelectPrimitive.Trigger
        className={clsx(
          'flex min-h-12 w-full items-center justify-between rounded-2xl',
          'border border-teal/15 bg-cream px-4 text-left text-base text-ink',
          'outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10',
          'data-[placeholder]:text-ink/40',
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon aria-hidden="true" className="ml-3 text-teal">
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={clsx(
            'z-50 max-h-[min(24rem,calc(100dvh-7rem))] overflow-hidden rounded-3xl border border-teal/15',
            'bg-cream p-2 text-ink shadow-xl shadow-teal/10',
          )}
          position="popper"
          sideOffset={8}
        >
          <SelectPrimitive.Viewport className="grid max-h-[min(23rem,calc(100dvh-8rem))] min-w-[var(--radix-select-trigger-width)] gap-1 overflow-y-auto overscroll-contain pr-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={clsx(
                  'relative flex min-h-11 cursor-pointer select-none items-center',
                  'rounded-2xl px-10 py-2 text-base outline-none transition',
                  'data-[highlighted]:bg-teal data-[highlighted]:text-cream',
                  'data-[state=checked]:bg-sand/30 data-[state=checked]:text-maroon',
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-3 grid h-5 w-5 place-items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-current" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
