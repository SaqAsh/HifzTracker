import Link from 'next/link';
import { notFound } from 'next/navigation';
import { startAdHocSession } from '@/app/actions';
import { LessonCard } from '@/components/lesson-card';
import { PageHeader } from '@/components/page-header';
import { ScheduleLessonForm } from '@/components/schedule-lesson-form';
import { SessionSummaryCard } from '@/components/session-summary-card';
import {
  emptyStateClassName,
  panelClassName,
  primaryButtonClassName,
} from '@/components/forms';
import { requireTeacher } from '@/lib/auth';
import { listLessonsForStudent } from '@/lib/data/lessons';
import { listSessionsForStudent } from '@/lib/data/sessions';
import { getStudent } from '@/lib/data/students';
import { daysSince, formatDate } from '@/lib/dates';
import { isUpcomingLesson } from '@/lib/lessons';
import { createClient } from '@/lib/supabase/server';

type StudentDetailPageProps = {
  params: Promise<{ id: string }>;
};

/** Detailed teacher view for one student. */
export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps): Promise<React.JSX.Element> {
  const { settings } = await requireTeacher();
  const { id } = await params;
  const supabase = await createClient();
  const [student, lessons, sessions] = await Promise.all([
    getStudent(supabase, id),
    listLessonsForStudent(supabase, id, {
      ascending: false,
    }),
    listSessionsForStudent(supabase, id),
  ]);

  if (!student) {
    notFound();
  }

  const upcomingLessons = lessons
    .filter((lesson) => isUpcomingLesson(lesson))
    .reverse();
  const returnTo = `/students/${student.id}`;

  return (
    <>
      <PageHeader
        eyebrow={`${daysSince(student.start_date)} days`}
        title={student.name}
        trailing={
          <Link
            className="text-sm font-bold text-teal"
            href={`/students/${student.id}/edit`}
          >
            Edit
          </Link>
        }
      />

      <section className={panelClassName}>
        <p className="font-semibold text-ink">{student.email}</p>
        {student.phone ? (
          <p className="text-sm text-ink/60">{student.phone}</p>
        ) : null}
        <p className="mt-2 text-sm text-ink/60">
          Started {formatDate(student.start_date)} · {student.status}
        </p>
        {student.notes ? (
          <p className="mt-3 rounded-2xl border border-teal/10 bg-cream px-4 py-3 text-sm text-ink">
            {student.notes}
          </p>
        ) : null}
        <form action={startAdHocSession} className="mt-4">
          <input name="studentId" type="hidden" value={student.id} />
          <button className={primaryButtonClassName} type="submit">
            Start Session
          </button>
        </form>
      </section>

      <ScheduleLessonForm
        defaultMaxMistakes={settings.max_mistakes_per_session}
        returnTo={returnTo}
        studentId={student.id}
      />

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl font-semibold text-teal">
          Upcoming Lessons
        </h2>
        {upcomingLessons.length === 0 ? (
          <div className={emptyStateClassName}>No upcoming lessons.</div>
        ) : (
          upcomingLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} returnTo={returnTo} />
          ))
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl font-semibold text-teal">
          Past Sessions
        </h2>
        {sessions.length === 0 ? (
          <div className={emptyStateClassName}>No sessions yet.</div>
        ) : (
          sessions.map((session) => (
            <SessionSummaryCard key={session.id} session={session} />
          ))
        )}
      </section>
    </>
  );
}
