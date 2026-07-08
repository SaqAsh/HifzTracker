'use client';

import { clsx } from 'clsx';
import { startTransition, useRef, useState } from 'react';
import { deleteSubacSession, finishSubacSession } from '@/app/actions';
import { dangerButtonClassName, secondaryButtonClassName } from './forms';

type SubacRotationParticipant = {
  id: string;
  mistakeCount: number;
  name: string;
  position: number;
};

type SubacRotationProps = {
  initialCurrentPosition: number;
  initialTotalMistakes: number;
  maxMistakes: number;
  participants: SubacRotationParticipant[];
  portionLabel: string;
  subacSessionId: string;
};

type SubacRotationState = {
  participants: SubacRotationParticipant[];
  totalMistakes: number;
};

/** Live Subac rotation board with per-student mistake targets. */
export function SubacRotation({
  initialCurrentPosition,
  initialTotalMistakes,
  maxMistakes,
  participants,
  portionLabel,
  subacSessionId,
}: SubacRotationProps): React.JSX.Element {
  const [state, setState] = useState<SubacRotationState>({
    participants,
    totalMistakes: initialTotalMistakes,
  });
  const stateRef = useRef<SubacRotationState>({
    participants,
    totalMistakes: initialTotalMistakes,
  });
  const [currentPosition, setCurrentPosition] = useState(
    initialCurrentPosition,
  );
  const currentPositionRef = useRef(initialCurrentPosition);
  const [isEnding, setIsEnding] = useState(false);
  const atMax = state.totalMistakes >= maxMistakes;
  const currentParticipant =
    state.participants.find(
      (participant) => participant.position === currentPosition,
    ) ?? state.participants[0];

  function addMistake(participantId: string): void {
    setState((current) => {
      if (current.totalMistakes >= maxMistakes) {
        return current;
      }

      const nextTotalMistakes = current.totalMistakes + 1;
      let nextParticipantMistakes = 0;
      const nextParticipants = current.participants.map((participant) => {
        if (participant.id !== participantId) {
          return participant;
        }

        nextParticipantMistakes = participant.mistakeCount + 1;
        return {
          ...participant,
          mistakeCount: nextParticipantMistakes,
        };
      });

      const nextState = {
        participants: nextParticipants,
        totalMistakes: nextTotalMistakes,
      };

      stateRef.current = nextState;
      return nextState;
    });
  }

  function advanceRotation(): void {
    const lastPosition = state.participants.length;
    const nextPosition =
      currentPosition >= lastPosition ? 1 : currentPosition + 1;

    setCurrentPosition(nextPosition);
    currentPositionRef.current = nextPosition;
  }

  function finish(): void {
    if (!window.confirm('Finish this Subac rotation?')) {
      return;
    }

    setIsEnding(true);
    const finalState = stateRef.current;
    const finalCurrentPosition = currentPositionRef.current;

    startTransition(() => {
      void finishSubacSession(subacSessionId, {
        currentPosition: finalCurrentPosition,
        participants: finalState.participants.map((participant) => ({
          id: participant.id,
          mistakeCount: participant.mistakeCount,
        })),
        totalMistakes: finalState.totalMistakes,
      });
    });
  }

  return (
    <section className="flex flex-1 flex-col gap-5">
      <div className="rounded-[2rem] border border-teal/15 bg-cream p-5 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-sand">
          Live Subac
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-teal">
          {portionLabel}
        </h1>
        <div
          aria-live="polite"
          className={clsx(
            'mt-5 font-serif text-6xl font-semibold leading-none transition-colors',
            atMax ? 'text-maroon' : 'text-teal',
          )}
        >
          {state.totalMistakes} / {maxMistakes}
        </div>
        <p className="mt-3 text-sm text-ink/60">
          {atMax
            ? 'Total mistake cap reached for this Subac session.'
            : `Current reciter: ${currentParticipant.name}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {state.participants.map((participant) => {
          const isCurrent = participant.position === currentPosition;

          return (
            <button
              aria-label={`Record mistake for ${participant.name}`}
              className={clsx(
                'relative aspect-square rounded-full border p-4 text-center shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed',
                isCurrent
                  ? 'border-teal bg-teal text-cream ring-4 ring-sand/40'
                  : 'border-teal/20 bg-cream text-teal hover:bg-teal/10',
                atMax && !isCurrent ? 'opacity-60' : '',
              )}
              disabled={atMax}
              key={participant.id}
              onClick={() => {
                addMistake(participant.id);
              }}
              type="button"
            >
              <span className="flex h-full flex-col items-center justify-center gap-2">
                <span className="max-w-full text-wrap font-serif text-2xl font-semibold leading-tight">
                  {participant.name}
                </span>
                <span className="text-sm font-bold">
                  {participant.mistakeCount} mistakes
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          className={secondaryButtonClassName}
          disabled={state.participants.length === 0}
          onClick={advanceRotation}
          type="button"
        >
          Next Reciter
        </button>
        <button
          className={dangerButtonClassName}
          disabled={isEnding}
          onClick={finish}
          type="button"
        >
          {isEnding ? 'Finishing...' : 'Finish Subac'}
        </button>
      </div>
      <form action={deleteSubacSession}>
        <input name="subacSessionId" type="hidden" value={subacSessionId} />
        <button className={`${dangerButtonClassName} w-full`} type="submit">
          Delete Subac
        </button>
      </form>
    </section>
  );
}
