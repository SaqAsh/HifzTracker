import { startLessonSession, updateLessonStatus } from '@/app/actions';
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from '@/components/forms';

/** Starts a live session from a scheduled lesson. */
export function StartSessionButton({
  lessonId,
}: {
  lessonId: string;
}): React.JSX.Element {
  return (
    <form action={startLessonSession}>
      <input name="lessonId" type="hidden" value={lessonId} />
      <button className={primaryButtonClassName} type="submit">
        Start
      </button>
    </form>
  );
}

type LessonStatusActionsProps = {
  lessonId: string;
  returnTo: string;
};

/** Complete/cancel controls for a scheduled lesson. */
export function LessonStatusActions({
  lessonId,
  returnTo,
}: LessonStatusActionsProps): React.JSX.Element {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {(['completed', 'cancelled'] as const).map((status) => (
        <form action={updateLessonStatus} key={status}>
          <input name="returnTo" type="hidden" value={returnTo} />
          <input name="lessonId" type="hidden" value={lessonId} />
          <input name="status" type="hidden" value={status} />
          <button className={secondaryButtonClassName} type="submit">
            {status === 'completed' ? 'Complete' : 'Cancel'}
          </button>
        </form>
      ))}
    </div>
  );
}
