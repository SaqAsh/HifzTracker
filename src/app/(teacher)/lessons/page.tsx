import { signOut } from '@/app/actions';
import { emptyStateClassName } from '@/components/forms';
import { RosterLessonCard } from '@/components/lesson-card';
import { PageHeader } from '@/components/page-header';
import { ScheduleLessonForm } from '@/components/schedule-lesson-form';
import { requireTeacher } from '@/lib/auth';
import { listLessonsForStudents } from '@/lib/data/lessons';
import { listActiveStudents } from '@/lib/data/students';
import { formatDate } from '@/lib/dates';
import { attachStudentNames, groupByDay } from '@/lib/lessons';
import { createClient } from '@/lib/supabase/server';

/** Teacher landing page with upcoming lessons grouped by day. */
export default async function LessonsPage(): Promise<React.JSX.Element> {
  const { settings } = await requireTeacher();
  const supabase = await createClient();
  const students = await listActiveStudents(supabase);
  const lessons = await listLessonsForStudents(
    supabase,
    students.map((student) => student.id),
  );
  const groupedLessons = groupByDay(attachStudentNames(lessons, students));

  return (
    <>
      <PageHeader
        eyebrow="Hifz & revision"
        title="Lessons"
        trailing={
          <form action={signOut}>
            <button className="text-sm font-bold text-teal" type="submit">
              Sign out
            </button>
          </form>
        }
      />

      <ScheduleLessonForm
        defaultMaxMistakes={settings.max_mistakes_per_session}
        returnTo="/lessons"
        students={students}
      />

      <section className="grid gap-4">
        {groupedLessons.size === 0 ? (
          <div className={emptyStateClassName}>No lessons scheduled yet.</div>
        ) : (
          Array.from(groupedLessons.entries()).map(([day, dayLessons]) => (
            <div className="grid gap-3" key={day}>
              <div className="flex items-center gap-3">
                <h2 className="shrink-0 font-serif text-xl font-semibold text-teal">
                  {formatDate(day)}
                </h2>
                <div className="h-px flex-1 bg-teal/20" />
              </div>
              {dayLessons.map((lesson) => (
                <RosterLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  returnTo="/lessons"
                  studentHref={`/students/${lesson.student_id}`}
                  studentName={lesson.studentName}
                />
              ))}
            </div>
          ))
        )}
      </section>
    </>
  );
}
