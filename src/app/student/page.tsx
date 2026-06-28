import { redirect } from 'next/navigation';
import { signOut } from '@/app/actions';
import { AppLogo } from '@/components/app-logo';
import { isTeacher } from '@/lib/auth';
import type { Lesson } from '@/lib/database.types';
import { formatDateTime } from '@/lib/dates';
import { formatAssignmentSummary } from '@/lib/quran';
import { createClient } from '@/lib/supabase/server';

function lessonStatusLabel(lesson: Lesson): string {
  if (lesson.status === 'scheduled') {
    return new Date(lesson.scheduled_at).getTime() >= Date.now()
      ? 'Upcoming'
      : 'Past scheduled';
  }

  return lesson.status;
}

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

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!student) {
    await supabase.auth.signOut();
    redirect('/student/login?error=not_on_file');
  }

  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('*')
    .eq('student_id', student.id)
    .order('scheduled_at', { ascending: true });
  const lessons = lessonsData ?? [];

  const now = Date.now();
  const upcomingLessons = lessons.filter(
    (lesson) =>
      lesson.status === 'scheduled' &&
      new Date(lesson.scheduled_at).getTime() >= now,
  );
  const pastLessons = lessons.filter(
    (lesson) =>
      lesson.status !== 'scheduled' ||
      new Date(lesson.scheduled_at).getTime() < now,
  );

  return (
    <main className="safe-screen mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AppLogo />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sand">
              Student Portal
            </p>
            <h1 className="font-serif text-3xl font-semibold text-teal">
              {student.name}
            </h1>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm font-bold text-teal">
            Sign out
          </button>
        </form>
      </header>

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
              <p className="font-semibold text-teal">
                {formatDateTime(lesson.scheduled_at)}
              </p>
              <p className="mt-3 rounded-2xl border border-teal/10 bg-cream px-4 py-3 text-sm font-semibold text-ink">
                {formatAssignmentSummary(lesson)}
              </p>
            </article>
          ))
        )}
      </section>

      <section className="grid gap-3 pb-8">
        <h2 className="font-serif text-2xl font-semibold text-teal">
          Past Lessons
        </h2>
        {pastLessons.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-teal/25 bg-cream p-5 text-center text-ink/60">
            No past lessons.
          </div>
        ) : (
          pastLessons.map((lesson) => (
            <article
              key={lesson.id}
              className="rounded-[2rem] border border-teal/15 bg-cream p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-teal">
                  {formatDateTime(lesson.scheduled_at)}
                </p>
                <span className="rounded-full bg-sand/35 px-3 py-1 text-xs font-bold uppercase tracking-wide text-maroon">
                  {lessonStatusLabel(lesson)}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">
                {formatAssignmentSummary(lesson)}
              </p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
