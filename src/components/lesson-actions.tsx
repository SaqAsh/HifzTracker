import {
  deleteLesson,
  startLessonSession,
  updateLessonStatus,
} from '@/app/actions';
import {
  dangerButtonClassName,
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
    <form action={startLessonSession} className="w-full">
      <input name="lessonId" type="hidden" value={lessonId} />
      <button className={`${primaryButtonClassName} w-full`} type="submit">
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
    <div className="grid gap-2">
      {(['completed', 'cancelled'] as const).map((status) => (
        <form action={updateLessonStatus} className="w-full" key={status}>
          <input name="returnTo" type="hidden" value={returnTo} />
          <input name="lessonId" type="hidden" value={lessonId} />
          <input name="status" type="hidden" value={status} />
          <button className={`${secondaryButtonClassName} w-full`} type="submit">
            {status === 'completed' ? 'Complete' : 'Cancel'}
          </button>
        </form>
      ))}
      <form action={deleteLesson} className="w-full">
        <input name="returnTo" type="hidden" value={returnTo} />
        <input name="lessonId" type="hidden" value={lessonId} />
        <button className={`${dangerButtonClassName} w-full`} type="submit">
          Delete
        </button>
      </form>
    </div>
  );
}
