import { emptyStateClassName } from '@/components/forms';
import { PageHeader } from '@/components/page-header';
import { StartSubacForm } from '@/components/start-subac-form';
import { SubacSessionCard } from '@/components/subac-session-card';
import { requireTeacher } from '@/lib/auth';
import { listSubacSessions } from '@/lib/data/subac';
import { listActiveStudents } from '@/lib/data/students';
import { createClient } from '@/lib/supabase/server';

/** Teacher Subac landing page for group rotation sessions. */
export default async function SubacPage(): Promise<React.JSX.Element> {
  const { settings } = await requireTeacher();
  const supabase = await createClient();
  const [students, sessions] = await Promise.all([
    listActiveStudents(supabase),
    listSubacSessions(supabase),
  ]);

  return (
    <>
      <PageHeader eyebrow="Group revision" title="Subac" />

      <StartSubacForm
        defaultMaxMistakes={settings.max_mistakes_per_session}
        students={students}
      />

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl font-semibold text-teal">
          Recent Subac
        </h2>
        {sessions.length === 0 ? (
          <div className={emptyStateClassName}>No Subac sessions yet.</div>
        ) : (
          sessions.map((session) => (
            <SubacSessionCard key={session.id} session={session} />
          ))
        )}
      </section>
    </>
  );
}
