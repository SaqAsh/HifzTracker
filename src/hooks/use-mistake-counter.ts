'use client';

import { startTransition, useRef, useState } from 'react';
import { endSession } from '@/app/actions';

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
  const countRef = useRef(initialCount);

  function addMistake(): void {
    setCount((current) => {
      const nextCount = current + 1;
      countRef.current = nextCount;
      return nextCount;
    });
  }

  function finish(): void {
    setIsEnding(true);
    const finalCount = countRef.current;

    startTransition(() => {
      void endSession(sessionId, finalCount);
    });
  }

  return { addMistake, atMax: count >= maxMistakes, count, finish, isEnding };
}
