import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  createLesson,
  startAdHocSession,
  startLessonSession,
  updateLessonStatus,
} from '@/app/actions';
import { AssignmentFields } from '@/components/assignment-fields';
import {
  Field,
  fieldClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from '@/components/forms';
import { DateTimePicker } from '@/components/date-time-picker';
import { PageHeader } from '@/components/page-header';
import { requireTeacher } from '@/lib/auth';
import {
  daysSince,
  formatDate,
  formatDateTime,
  formatDuration,
  toDateTimeLocalValue,
} from '@/lib/dates';
import { formatAssignmentSummary } from '@/lib/quran';
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
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!student) {
    notFound();
  }

  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('*')
    .eq('student_id', student.id)
    .order('scheduled_at', { ascending: false });
  const lessons = lessonsData ?? [];

  const { data: sessionsData } = await supabase
    .from('sessions')
    .select('*')
    .eq('student_id', student.id)
    .order('started_at', { ascending: false });
  const sessions = sessionsData ?? [];

  const upcomingLessons = lessons
    .filter(
      (lesson) =>
        lesson.status === 'scheduled' &&
        new Date(lesson.scheduled_at).getTime() >= Date.now(),
    )
    .reverse();

  return (
    <>
      <PageHeader
        eyebrow={`${daysSince(student.start_date)} days`}
        title={student.name}
        trailing={
          <Link
            href={`/students/${student.id}/edit`}
            className="text-sm font-bold text-teal"
          >
            Edit
          </Link>
        }
      />

      <section className="rounded-[2rem] border border-teal/15 bg-cream p-5 shadow-sm sm:p-6">
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
          <input type="hidden" name="studentId" value={student.id} />
          <button className={primaryButtonClassName} type="submit">
            Start Session
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-teal/15 bg-cream p-4 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-teal">
          Schedule Lesson
        </h2>
        <form action={createLesson} className="mt-4 grid gap-4">
          <input
            type="hidden"
            name="returnTo"
            value={`/students/${student.id}`}
          />
          <input type="hidden" name="studentId" value={student.id} />
          <div className="grid gap-3">
            <Field label="Date/time">
              <DateTimePicker
                name="scheduledAt"
                defaultValue={toDateTimeLocalValue()}
              />
            </Field>
            <Field label="Mistakes allowed">
              <input
                className={fieldClassName}
                name="maxMistakes"
                type="number"
                min="1"
                defaultValue={settings.max_mistakes_per_session}
                required
              />
            </Field>
          </div>
          <AssignmentFields />
          <button className={`${primaryButtonClassName} w-full`} type="submit">
            Add Lesson
          </button>
        </form>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl font-semibold text-teal">
          Upcoming Lessons
        </h2>
        {upcomingLessons.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-teal/25 bg-cream p-5 text-center text-ink/60">
            No upcoming lessons.
          </div>
        ) : (
          upcomingLessons.map((lesson) => (
            <article
              key={lesson.id}
              className="rounded-[2rem] border border-teal/15 bg-cream p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-teal">
                    {formatDateTime(lesson.scheduled_at)}
                  </p>
                  <p className="text-sm text-ink/60">
                    {lesson.max_mistakes} mistakes allowed
                  </p>
                </div>
                <form action={startLessonSession}>
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <button className={primaryButtonClassName} type="submit">
                    Start
                  </button>
                </form>
              </div>
              <p className="mt-3 rounded-2xl border border-teal/10 bg-cream px-4 py-3 text-sm font-semibold text-ink">
                {formatAssignmentSummary(lesson)}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <form action={updateLessonStatus}>
                  <input
                    type="hidden"
                    name="returnTo"
                    value={`/students/${student.id}`}
                  />
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <input type="hidden" name="status" value="completed" />
                  <button className={secondaryButtonClassName} type="submit">
                    Complete
                  </button>
                </form>
                <form action={updateLessonStatus}>
                  <input
                    type="hidden"
                    name="returnTo"
                    value={`/students/${student.id}`}
                  />
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <input type="hidden" name="status" value="cancelled" />
                  <button className={secondaryButtonClassName} type="submit">
                    Cancel
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl font-semibold text-teal">
          Past Sessions
        </h2>
        {sessions.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-teal/25 bg-cream p-5 text-center text-ink/60">
            No sessions yet.
          </div>
        ) : (
          sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-[2rem] border border-teal/15 bg-cream p-4 shadow-sm"
            >
              <p className="font-semibold text-teal">
                {formatDateTime(session.started_at)}
              </p>
              <p className="mt-1 text-sm text-ink/60">
                {session.ended_at
                  ? formatDuration(session.started_at, session.ended_at)
                  : 'In progress'}
              </p>
              <p className="mt-2 font-serif text-2xl font-semibold text-ink">
                {session.mistake_count} / {session.max_mistakes_snapshot}
              </p>
            </article>
          ))
        )}
      </section>
    </>
  );
}
