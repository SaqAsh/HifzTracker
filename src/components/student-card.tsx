import Link from 'next/link';
import { archiveStudent } from '@/app/actions';
import {
  cardClassName,
  dangerButtonClassName,
  secondaryButtonClassName,
} from '@/components/forms';
import type { Student } from '@/lib/database.types';
import { daysSince, formatDate } from '@/lib/dates';
import { STUDENT_STATUS } from '@/lib/statuses';

/** Roster row for a single student. */
export function StudentCard({
  student,
}: {
  student: Student;
}): React.JSX.Element {
  return (
    <article className={cardClassName}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            className="font-serif text-2xl font-semibold text-teal"
            href={`/students/${student.id}`}
          >
            {student.name}
          </Link>
          <p className="text-sm text-ink/60">{student.email}</p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {daysSince(student.start_date)} days as student
          </p>
          <p className="text-sm text-ink/60">
            Started {formatDate(student.start_date)}
          </p>
        </div>
        <span className="rounded-full bg-sand/35 px-3 py-1 text-xs font-bold uppercase tracking-wide text-maroon">
          {student.status}
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          className={secondaryButtonClassName}
          href={`/students/${student.id}/edit`}
        >
          Edit
        </Link>
        {student.status === STUDENT_STATUS.INACTIVE ? null : (
          <form action={archiveStudent}>
            <input name="studentId" type="hidden" value={student.id} />
            <button className={dangerButtonClassName} type="submit">
              Archive
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
