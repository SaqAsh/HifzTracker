import { assignmentSummaryClassName, cardClassName } from '@/components/forms';
import { LessonEditPanel } from '@/components/lesson-edit-panel';
import { StartSessionButton } from '@/components/lesson-actions';
import { StudentPrefetchLink } from '@/components/student-prefetch-link';
import type { Lesson } from '@/lib/database.types';
import { formatDateTime, formatTime } from '@/lib/dates';
import { formatAssignmentSummary } from '@/lib/quran';

type LessonCardShellProps = {
  header: React.ReactNode;
  lesson: Lesson;
  returnTo: string;
  students?: { id: string; name: string }[];
};

/** Shared lesson card layout: header, edit control, assignment summary, and start action. */
function LessonCardShell({
  header,
  lesson,
  returnTo,
  students,
}: LessonCardShellProps): React.JSX.Element {
  return (
    <article className={`${cardClassName} relative`}>
      <div className="pr-12">{header}</div>
      <p className={assignmentSummaryClassName}>
        {formatAssignmentSummary(lesson)}
      </p>
      <div className="mt-3">
        <StartSessionButton lessonId={lesson.id} />
      </div>
      <LessonEditPanel
        lesson={lesson}
        returnTo={returnTo}
        students={students}
      />
    </article>
  );
}

type LessonCardProps = {
  lesson: Lesson;
  returnTo: string;
};

/** Lesson card for a single student's schedule (date/time heading). */
export function LessonCard({
  lesson,
  returnTo,
}: LessonCardProps): React.JSX.Element {
  return (
    <LessonCardShell
      header={
        <div>
          <p className="font-semibold text-teal">
            {formatDateTime(lesson.scheduled_at)}
          </p>
          <p className="mt-1 text-sm text-ink/60">
            {lesson.max_mistakes} mistakes allowed
          </p>
        </div>
      }
      lesson={lesson}
      returnTo={returnTo}
    />
  );
}

type RosterLessonCardProps = {
  lesson: Lesson;
  returnTo: string;
  students: { id: string; name: string }[];
  studentHref: string;
  studentName: string;
};

/** Lesson card for the cross-student roster (time + linked student name). */
export function RosterLessonCard({
  lesson,
  returnTo,
  students,
  studentHref,
  studentName,
}: RosterLessonCardProps): React.JSX.Element {
  return (
    <LessonCardShell
      header={
        <div>
          <p className="text-sm font-bold text-sand">
            {formatTime(lesson.scheduled_at)}
          </p>
          <StudentPrefetchLink
            className="font-serif text-2xl font-semibold text-teal"
            href={studentHref}
          >
            {studentName}
          </StudentPrefetchLink>
          <p className="mt-1 text-sm text-ink/60">
            {lesson.max_mistakes} mistakes allowed
          </p>
          <span className="mt-2 inline-flex rounded-full border border-teal/15 bg-cream px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal">
            {lesson.status}
          </span>
        </div>
      }
      lesson={lesson}
      returnTo={returnTo}
      students={students}
    />
  );
}
