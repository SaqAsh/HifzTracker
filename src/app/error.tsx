'use client';

import { useEffect } from 'react';
import { AppLogo } from '@/components/app-logo';
import { primaryButtonClassName } from '@/components/forms';

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Branded error boundary for thrown server action and render errors. */
export default function ErrorBoundary({
  error,
  reset,
}: ErrorBoundaryProps): React.JSX.Element {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="safe-screen grid place-items-center px-4 py-8">
      <section className="w-full max-w-sm rounded-[2rem] border border-teal/15 bg-cream p-6 text-center shadow-sm">
        <div className="mb-6 grid justify-items-center gap-4">
          <AppLogo size="lg" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sand">
              Something went wrong
            </p>
            <h1 className="font-serif text-4xl font-semibold text-teal">
              Unexpected error
            </h1>
          </div>
        </div>
        <p className="mb-6 text-sm text-ink/60">
          The action could not be completed. Please try again.
        </p>
        <button
          className={primaryButtonClassName}
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
