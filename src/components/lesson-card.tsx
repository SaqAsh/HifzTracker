import Link from 'next/link';
import { assignmentSummaryClassName, cardClassName } from '@/components/forms';
import {
  LessonStatusActions,
  StartSessionButton,
} from '@/components/lesson-actions';
import type { Lesson } from '@/lib/database.types';
import { formatDateTime, formatTime } from '@/lib/dates';
import { formatAssignmentSummary } from '@/lib/quran';

type LessonCardShellProps = {
  header: React.ReactNode;
  lesson: Lesson;
  returnTo: string;
};

/** Shared lesson card layout: header, start control, summary, status actions. */
function LessonCardShell({
  header,
  lesson,
  returnTo,
}: LessonCardShellProps): React.JSX.Element {
  return (
    <article className={cardClassName}>
      <div className="flex items-start justify-between gap-3">
        {header}
        <StartSessionButton lessonId={lesson.id} />
      </div>
      <p className={assignmentSummaryClassName}>
        {formatAssignmentSummary(lesson)}
      </p>
      <LessonStatusActions lessonId={lesson.id} returnTo={returnTo} />
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
  studentHref: string;
  studentName: string;
};

/** Lesson card for the cross-student roster (time + linked student name). */
export function RosterLessonCard({
  lesson,
  returnTo,
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
          <Link
            className="font-serif text-2xl font-semibold text-teal"
            href={studentHref}
          >
            {studentName}
          </Link>
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
    />
  );
}
