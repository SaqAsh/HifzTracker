import { redirect } from 'next/navigation';
import { signOut } from '@/app/actions';
import { emptyStateClassName } from '@/components/forms';
import { PageHeader } from '@/components/page-header';
import { StudentLessonCard } from '@/components/student-lesson-card';
import { isTeacher } from '@/lib/auth';
import { listLessonsForStudent } from '@/lib/data/lessons';
import { getStudentByUserId } from '@/lib/data/students';
import { isUpcomingLesson } from '@/lib/lessons';
import { createClient } from '@/lib/supabase/server';

/** Read-only portal for a signed-in student. */
export default async function StudentPortalPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/student/login');
  }

  if (await isTeacher(user.id)) {
    redirect('/lessons');
  }

  const student = await getStudentByUserId(supabase, user.id);

  if (!student) {
    await supabase.auth.signOut();
    redirect('/student/login?error=not_on_file');
  }

  const lessons = await listLessonsForStudent(supabase, student.id, {
    ascending: true,
  });
  const upcomingLessons = lessons.filter((lesson) => isUpcomingLesson(lesson));
  const pastLessons = lessons.filter((lesson) => !isUpcomingLesson(lesson));

  return (
    <div className="safe-screen">
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Student Portal"
          title={student.name}
          trailing={
            <form action={signOut}>
              <button className="text-sm font-bold text-teal" type="submit">
                Sign out
              </button>
            </form>
          }
        />

        <section className="grid gap-3">
          <h2 className="font-serif text-2xl font-semibold text-teal">
            Upcoming Lessons
          </h2>
          {upcomingLessons.length === 0 ? (
            <div className={emptyStateClassName}>No upcoming lessons.</div>
          ) : (
            upcomingLessons.map((lesson) => (
              <StudentLessonCard key={lesson.id} lesson={lesson} />
            ))
          )}
        </section>

        <section className="grid gap-3 pb-8">
          <h2 className="font-serif text-2xl font-semibold text-teal">
            Past Lessons
          </h2>
          {pastLessons.length === 0 ? (
            <div className={emptyStateClassName}>No past lessons.</div>
          ) : (
            pastLessons.map((lesson) => (
              <StudentLessonCard key={lesson.id} lesson={lesson} showStatus />
            ))
          )}
        </section>
      </main>
    </div>
  );
}
