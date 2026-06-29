'use client';

import { startTransition, useRef, useState } from 'react';
import { endSession, setMistakeCount } from '@/app/actions';

type UseMistakeCounter = {
  addMistake: () => void;
  atMax: boolean;
  count: number;
  finish: () => void;
  isEnding: boolean;
};

/**
 * Drives the live mistake counter with optimistic local state and a serialized
 * write queue so out-of-order persistence never clobbers a newer count.
 */
export function useMistakeCounter(
  sessionId: string,
  initialCount: number,
  maxMistakes: number,
): UseMistakeCounter {
  const [count, setCount] = useState(initialCount);
  const [isEnding, setIsEnding] = useState(false);
  const queue = useRef<Promise<void>>(Promise.resolve());

  function persist(nextCount: number): void {
    queue.current = queue.current
      .then(() => setMistakeCount(sessionId, nextCount))
      .catch(() => undefined);
  }

  function addMistake(): void {
    setCount((current) => {
      const nextCount = current + 1;
      persist(nextCount);
      return nextCount;
    });
  }

  function finish(): void {
    setIsEnding(true);
    startTransition(() => {
      void queue.current.finally(() => {
        void endSession(sessionId, count);
      });
    });
  }

  return { addMistake, atMax: count >= maxMistakes, count, finish, isEnding };
}
