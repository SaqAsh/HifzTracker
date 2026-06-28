import Link from 'next/link';
import {
  createLesson,
  signOut,
  startLessonSession,
  updateLessonStatus,
} from '@/app/actions';
import {
  Field,
  fieldClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from '@/components/forms';
import { AssignmentFields } from '@/components/assignment-fields';
import { DateTimePicker } from '@/components/date-time-picker';
import { PageHeader } from '@/components/page-header';
import { UiSelect } from '@/components/ui-select';
import { requireTeacher } from '@/lib/auth';
import type { Lesson, Student } from '@/lib/database.types';
import { formatDate, formatTime, toDateTimeLocalValue } from '@/lib/dates';
import { formatAssignmentSummary } from '@/lib/quran';
import { createClient } from '@/lib/supabase/server';

type LessonWithStudent = Lesson & {
  studentName: string;
};

function attachStudentNames(
  lessons: Lesson[],
  students: Student[],
): LessonWithStudent[] {
  const names = new Map(students.map((student) => [student.id, student.name]));
  return lessons.map((lesson) => ({
    ...lesson,
    studentName: names.get(lesson.student_id) ?? 'Unknown student',
  }));
}

function groupByDay(
  lessons: LessonWithStudent[],
): Map<string, LessonWithStudent[]> {
  const groups = new Map<string, LessonWithStudent[]>();

  lessons.forEach((lesson) => {
    const day = lesson.scheduled_at.slice(0, 10);
    groups.set(day, [...(groups.get(day) ?? []), lesson]);
  });

  return groups;
}

/** Teacher landing page with upcoming lessons grouped by day. */
export default async function LessonsPage(): Promise<React.JSX.Element> {
  const { settings } = await requireTeacher();
  const supabase = await createClient();
  const { data: studentsData } = await supabase
    .from('students')
    .select('*')
    .neq('status', 'inactive')
    .order('name');
  const students = studentsData ?? [];

  const studentIds = students.map((student) => student.id);
  const { data: lessonsData } =
    studentIds.length === 0
      ? { data: [] }
      : await supabase
          .from('lessons')
          .select('*')
          .in('student_id', studentIds)
          .order('scheduled_at');
  const lessons = lessonsData ?? [];

  const lessonsWithStudents = attachStudentNames(lessons, students);
  const groupedLessons = groupByDay(lessonsWithStudents);

  return (
    <>
      <PageHeader
        eyebrow="Hifz & revision"
        title="Lessons"
        trailing={
          <form action={signOut}>
            <button type="submit" className="text-sm font-bold text-teal">
              Sign out
            </button>
          </form>
        }
      />

      <section className="rounded-[2rem] border border-teal/15 bg-cream p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-2xl font-semibold text-teal">
          Schedule Lesson
        </h2>
        <form action={createLesson} className="mt-4 grid gap-4">
          <input type="hidden" name="returnTo" value="/lessons" />
          <Field label="Student">
            <UiSelect
              name="studentId"
              placeholder="Choose student"
              options={students.map((student) => ({
                label: student.name,
                value: student.id,
              }))}
            />
          </Field>
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

      <section className="grid gap-4">
        {groupedLessons.size === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-teal/25 bg-cream p-6 text-center text-ink/60">
            No lessons scheduled yet.
          </div>
        ) : (
          Array.from(groupedLessons.entries()).map(([day, dayLessons]) => (
            <div key={day} className="grid gap-3">
              <div className="flex items-center gap-3">
                <h2 className="shrink-0 font-serif text-xl font-semibold text-teal">
                  {formatDate(day)}
                </h2>
                <div className="h-px flex-1 bg-teal/20" />
              </div>
              {dayLessons.map((lesson) => (
                <article
                  key={lesson.id}
                  className="rounded-[2rem] border border-teal/15 bg-cream p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-sand">
                        {formatTime(lesson.scheduled_at)}
                      </p>
                      <Link
                        href={`/students/${lesson.student_id}`}
                        className="font-serif text-2xl font-semibold text-teal"
                      >
                        {lesson.studentName}
                      </Link>
                      <p className="mt-1 text-sm text-ink/60">
                        {lesson.max_mistakes} mistakes allowed
                      </p>
                      <span className="mt-2 inline-flex rounded-full border border-teal/15 bg-cream px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal">
                        {lesson.status}
                      </span>
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
                      <input type="hidden" name="returnTo" value="/lessons" />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <input type="hidden" name="status" value="completed" />
                      <button
                        className={secondaryButtonClassName}
                        type="submit"
                      >
                        Complete
                      </button>
                    </form>
                    <form action={updateLessonStatus}>
                      <input type="hidden" name="returnTo" value="/lessons" />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button
                        className={secondaryButtonClassName}
                        type="submit"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ))
        )}
      </section>
    </>
  );
}
