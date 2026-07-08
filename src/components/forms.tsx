import { clsx } from 'clsx';

export const fieldClassName =
  'min-h-12 w-full rounded-2xl border border-teal/15 bg-cream px-4 text-base text-ink outline-none transition placeholder:text-ink/35 focus:border-teal focus:ring-4 focus:ring-teal/10';

export const labelClassName = 'text-sm font-semibold text-teal';

export const primaryButtonClassName =
  'tap-target inline-flex w-full items-center justify-center rounded-2xl bg-teal px-5 py-3 text-center text-sm font-bold text-cream shadow-sm transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButtonClassName =
  'tap-target inline-flex w-full items-center justify-center rounded-2xl border border-teal/20 bg-cream px-5 py-3 text-center text-sm font-bold text-teal transition hover:bg-teal/10';

export const dangerButtonClassName =
  'tap-target inline-flex w-full items-center justify-center rounded-2xl bg-maroon px-5 py-3 text-center text-sm font-bold text-cream shadow-sm transition hover:bg-maroon/90';

export const cardClassName =
  'rounded-[2rem] border border-teal/15 bg-cream p-4 shadow-sm';

export const panelClassName =
  'rounded-[2rem] border border-teal/15 bg-cream p-5 shadow-sm sm:p-6';

export const emptyStateClassName =
  'rounded-[2rem] border border-dashed border-teal/25 bg-cream p-5 text-center text-ink/60';

export const assignmentSummaryClassName =
  'mt-3 rounded-2xl border border-teal/10 bg-cream px-4 py-3 text-sm font-semibold text-ink';

type FieldProps = {
  children?: React.ReactNode;
  className?: string;
  label: string;
};

/** Form field wrapper for consistent mobile spacing. */
export function Field({
  children,
  className,
  label,
}: FieldProps): React.JSX.Element {
  return (
    <label className={clsx('grid gap-2', className)}>
      <span className={labelClassName}>{label}</span>
      {children}
    </label>
  );
}
