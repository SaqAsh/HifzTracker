import { startLessonSession } from '@/app/actions';
import { primaryButtonClassName } from '@/components/forms';

/** Starts a live session from a scheduled lesson. */
export function StartSessionButton({
  lessonId,
}: {
  lessonId: string;
}): React.JSX.Element {
  return (
    <form action={startLessonSession} className="w-full">
      <input name="lessonId" type="hidden" value={lessonId} />
      <button className={primaryButtonClassName} type="submit">
        Start
      </button>
    </form>
  );
}
