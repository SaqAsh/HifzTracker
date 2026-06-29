import { notFound } from 'next/navigation';
import { MistakeCounter } from '@/components/mistake-counter';
import { PageHeader } from '@/components/page-header';
import { requireTeacher } from '@/lib/auth';
import { getSession } from '@/lib/data/sessions';
import { getStudent } from '@/lib/data/students';
import { formatDateTime, formatDuration } from '@/lib/dates';
import { createClient } from '@/lib/supabase/server';

type SessionPageProps = {
  params: Promise<{ id: string }>;
};

/** Live or completed session page. */
export default async function SessionPage({
  params,
}: SessionPageProps): Promise<React.JSX.Element> {
  await requireTeacher();
  const { id } = await params;
  const supabase = await createClient();
  const session = await getSession(supabase, id);

  if (!session) {
    notFound();
  }

  const student = await getStudent(supabase, session.student_id);

  if (!student) {
    notFound();
  }

  if (session.ended_at) {
    return (
      <>
        <PageHeader eyebrow="Completed" title={student.name} />
        <section className="rounded-[2rem] border border-teal/15 bg-cream p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-ink/60">
            {formatDateTime(session.started_at)} ·{' '}
            {formatDuration(session.started_at, session.ended_at)}
          </p>
          <p className="mt-4 font-serif text-6xl font-semibold text-teal">
            {session.mistake_count} / {session.max_mistakes_snapshot}
          </p>
        </section>
      </>
    );
  }

  return (
    <MistakeCounter
      initialCount={session.mistake_count}
      maxMistakes={session.max_mistakes_snapshot}
      sessionId={session.id}
      studentName={student.name}
    />
  );
}
