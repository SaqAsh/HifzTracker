import Link from 'next/link';
import { cardClassName } from '@/components/forms';
import type { SubacSession } from '@/lib/database.types';
import { formatDateTime, formatDuration } from '@/lib/dates';

type SubacSessionCardProps = {
  session: SubacSession;
};

/** Recent Subac session summary for the Subac landing page. */
export function SubacSessionCard({
  session,
}: SubacSessionCardProps): React.JSX.Element {
  return (
    <article className={cardClassName}>
      <Link className="block" href={`/subac/${session.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words font-serif text-2xl font-semibold text-teal">
              {session.portion_label}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              {formatDateTime(session.started_at)}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-teal/15 bg-cream px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal">
            {session.ended_at ? 'Done' : 'Live'}
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-sm text-ink/60">
            {session.ended_at
              ? formatDuration(session.started_at, session.ended_at)
              : 'In progress'}
          </p>
          <p className="font-serif text-3xl font-semibold text-ink">
            {session.mistake_count} / {session.max_mistakes_snapshot}
          </p>
        </div>
      </Link>
    </article>
  );
}
