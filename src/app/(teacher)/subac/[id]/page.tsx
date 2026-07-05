import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cardClassName, secondaryButtonClassName } from '@/components/forms';
import { PageHeader } from '@/components/page-header';
import { SubacRotation } from '@/components/subac-rotation';
import { requireTeacher } from '@/lib/auth';
import { getSubacSession, listSubacParticipants } from '@/lib/data/subac';
import { formatDateTime, formatDuration } from '@/lib/dates';
import { createClient } from '@/lib/supabase/server';

type SubacSessionPageProps = {
  params: Promise<{ id: string }>;
};

/** Live or completed Subac rotation page. */
export default async function SubacSessionPage({
  params,
}: SubacSessionPageProps): Promise<React.JSX.Element> {
  await requireTeacher();
  const { id } = await params;
  const supabase = await createClient();
  const session = await getSubacSession(supabase, id);

  if (!session) {
    notFound();
  }

  const participants = await listSubacParticipants(supabase, session.id);

  if (participants.length < 2) {
    notFound();
  }

  if (session.ended_at) {
    return (
      <>
        <PageHeader eyebrow="Completed Subac" title={session.portion_label} />
        <section className="rounded-[2rem] border border-teal/15 bg-cream p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-ink/60">
            {formatDateTime(session.started_at)} ·{' '}
            {formatDuration(session.started_at, session.ended_at)}
          </p>
          <p className="mt-4 font-serif text-6xl font-semibold text-teal">
            {session.mistake_count} / {session.max_mistakes_snapshot}
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="font-serif text-2xl font-semibold text-teal">
            Rotation Results
          </h2>
          {participants.map((participant) => (
            <article
              className={`${cardClassName} flex items-center justify-between gap-4`}
              key={participant.id}
            >
              <div>
                <p className="text-sm font-bold text-sand">
                  Order {participant.position}
                </p>
                <p className="font-serif text-2xl font-semibold text-teal">
                  {participant.student.name}
                </p>
              </div>
              <p className="font-serif text-3xl font-semibold text-ink">
                {participant.mistake_count}
              </p>
            </article>
          ))}
        </section>

        <Link className={secondaryButtonClassName} href="/subac">
          Back to Subac
        </Link>
      </>
    );
  }

  return (
    <SubacRotation
      initialCurrentPosition={session.current_rotation_position}
      initialTotalMistakes={session.mistake_count}
      maxMistakes={session.max_mistakes_snapshot}
      participants={participants.map((participant) => ({
        id: participant.id,
        mistakeCount: participant.mistake_count,
        name: participant.student.name,
        position: participant.position,
      }))}
      portionLabel={session.portion_label}
      subacSessionId={session.id}
    />
  );
}
