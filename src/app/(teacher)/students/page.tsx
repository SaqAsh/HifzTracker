import Link from 'next/link';
import { archiveStudent } from '@/app/actions';
import { AddStudentDialog } from '@/components/add-student-dialog';
import {
  dangerButtonClassName,
  secondaryButtonClassName,
} from '@/components/forms';
import { PageHeader } from '@/components/page-header';
import { requireTeacher } from '@/lib/auth';
import { daysSince, formatDate } from '@/lib/dates';
import { createClient } from '@/lib/supabase/server';

/** Teacher student list and add form. */
export default async function StudentsPage(): Promise<React.JSX.Element> {
  await requireTeacher();
  const supabase = await createClient();
  const { data: studentsData } = await supabase
    .from('students')
    .select('*')
    .order('name');
  const students = studentsData ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Roster"
        title="Students"
        trailing={<AddStudentDialog />}
      />

      <section className="grid gap-3">
        {students.map((student) => (
          <article
            key={student.id}
            className="rounded-[2rem] border border-teal/15 bg-cream p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/students/${student.id}`}
                  className="font-serif text-2xl font-semibold text-teal"
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
                href={`/students/${student.id}/edit`}
                className={secondaryButtonClassName}
              >
                Edit
              </Link>
              {student.status !== 'inactive' ? (
                <form action={archiveStudent}>
                  <input type="hidden" name="studentId" value={student.id} />
                  <button className={dangerButtonClassName} type="submit">
                    Archive
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
