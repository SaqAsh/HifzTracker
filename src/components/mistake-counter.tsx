'use client';

import { clsx } from 'clsx';
import { startTransition, useRef, useState } from 'react';
import { endSession, setMistakeCount } from '@/app/actions';

type MistakeCounterProps = {
  initialCount: number;
  maxMistakes: number;
  sessionId: string;
  studentName: string;
};

/** Large optimistic mistake counter for the live teaching session. */
export function MistakeCounter({
  initialCount,
  maxMistakes,
  sessionId,
  studentName,
}: MistakeCounterProps): React.JSX.Element {
  const [count, setCount] = useState(initialCount);
  const [isEnding, setIsEnding] = useState(false);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const atMax = count >= maxMistakes;

  function persist(nextCount: number): void {
    queue.current = queue.current
      .then(async () => {
        await setMistakeCount(sessionId, nextCount);
      })
      .catch(() => undefined);
  }

  function addMistake(): void {
    const nextCount = count + 1;
    setCount(nextCount);
    persist(nextCount);
  }

  function finish(): void {
    setIsEnding(true);
    startTransition(() => {
      void queue.current.finally(() => {
        void endSession(sessionId, count);
      });
    });
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="rounded-[2rem] border border-teal/15 bg-cream p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-sand">
          Live session
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-teal">
          {studentName}
        </h1>
        <div
          className={clsx(
            'mt-6 font-serif text-7xl font-semibold leading-none transition-colors',
            atMax ? 'text-maroon' : 'text-teal',
          )}
          aria-live="polite"
        >
          {count} / {maxMistakes}
        </div>
        <p className="mt-3 text-sm text-ink/60">
          {atMax
            ? 'Mistakes allowed reached. Continue if the session needs it.'
            : 'Tap the button immediately when a mistake happens.'}
        </p>
      </div>

      <button
        type="button"
        onClick={addMistake}
        className={clsx(
          'relative grid min-h-[18rem] flex-1 place-items-center overflow-hidden rounded-[2.5rem] px-8 font-serif text-4xl font-semibold text-cream shadow-xl transition active:scale-[0.99]',
          atMax ? 'bg-maroon' : 'bg-teal',
        )}
      >
        <span className="absolute inset-8 rounded-full border border-cream/25" />
        <span className="absolute inset-16 rounded-full border border-sand/40" />
        <span className="relative">Mistake +1</span>
      </button>

      <button
        type="button"
        onClick={finish}
        disabled={isEnding}
        className="tap-target rounded-2xl border border-teal/20 bg-cream px-5 py-4 text-center text-base font-bold text-teal transition hover:bg-teal/10 disabled:opacity-60"
      >
        {isEnding ? 'Ending...' : 'End Session'}
      </button>
    </section>
  );
}
