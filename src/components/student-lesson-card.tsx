import { assignmentSummaryClassName, cardClassName } from '@/components/forms';
import type { Lesson } from '@/lib/database.types';
import { formatDateTime } from '@/lib/dates';
import { lessonStatusLabel } from '@/lib/lessons';
import { formatAssignmentSummary } from '@/lib/quran';

type StudentLessonCardProps = {
  lesson: Lesson;
  showStatus?: boolean;
};

/** Read-only lesson card for the student portal. */
export function StudentLessonCard({
  lesson,
  showStatus,
}: StudentLessonCardProps): React.JSX.Element {
  return (
    <article className={cardClassName}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-teal">
          {formatDateTime(lesson.scheduled_at)}
        </p>
        {showStatus ? (
          <span className="rounded-full bg-sand/35 px-3 py-1 text-xs font-bold uppercase tracking-wide text-maroon">
            {lessonStatusLabel(lesson)}
          </span>
        ) : null}
      </div>
      <p className={assignmentSummaryClassName}>
        {formatAssignmentSummary(lesson)}
      </p>
    </article>
  );
}
