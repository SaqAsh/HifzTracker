import { cardClassName } from '@/components/forms';
import type { Session } from '@/lib/database.types';
import { formatDateTime, formatDuration } from '@/lib/dates';

/** Past session summary card for the student detail view. */
export function SessionSummaryCard({
  session,
}: {
  session: Session;
}): React.JSX.Element {
  return (
    <article className={cardClassName}>
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
  );
}
