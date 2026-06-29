import type { DbClient } from '@/lib/data/client';
import {
  expectOk,
  unwrapList,
  unwrapMaybe,
  unwrapSingle,
} from '@/lib/data/unwrap';
import type { Session, SessionInsert } from '@/lib/database.types';

/** Fetches a single session by id, or null when missing. */
export async function getSession(
  db: DbClient,
  id: string,
): Promise<null | Session> {
  return unwrapMaybe(
    await db.from('sessions').select('*').eq('id', id).maybeSingle(),
  );
}

/** Lists a student's sessions, most recent first. */
export async function listSessionsForStudent(
  db: DbClient,
  studentId: string,
): Promise<Session[]> {
  return unwrapList(
    await db
      .from('sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false }),
  );
}

/** Inserts a session and returns its id. */
export async function insertSession(
  db: DbClient,
  values: SessionInsert,
): Promise<string> {
  const session = unwrapSingle(
    await db.from('sessions').insert(values).select('id').single(),
  );
  return session.id;
}

/** Persists the live mistake count for a session that has not ended. */
export async function updateMistakeCount(
  db: DbClient,
  id: string,
  mistakeCount: number,
): Promise<void> {
  expectOk(
    await db
      .from('sessions')
      .update({ mistake_count: mistakeCount })
      .eq('id', id)
      .is('ended_at', null),
  );
}

/** Ends a session, stamping the end time and final count. */
export async function endSession(
  db: DbClient,
  id: string,
  mistakeCount: number,
): Promise<Session> {
  return unwrapSingle(
    await db
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        mistake_count: mistakeCount,
      })
      .eq('id', id)
      .select('*')
      .single(),
  );
}
