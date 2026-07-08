import type { DbClient } from '@/lib/data/client';
import {
  expectOk,
  unwrapList,
  unwrapMaybe,
  unwrapSingle,
} from '@/lib/data/unwrap';
import type {
  Student,
  SubacParticipant,
  SubacParticipantInsert,
  SubacSession,
  SubacSessionInsert,
} from '@/lib/database.types';

export type SubacParticipantWithStudent = SubacParticipant & {
  student: Pick<Student, 'id' | 'name'>;
};

/** Lists recent Subac sessions for the current teacher, newest first. */
export async function listSubacSessions(
  db: DbClient,
  limit = 20,
): Promise<SubacSession[]> {
  return unwrapList(
    await db
      .from('subac_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit),
  );
}

/** Fetches one Subac session by id, or null when missing. */
export async function getSubacSession(
  db: DbClient,
  id: string,
): Promise<null | SubacSession> {
  return unwrapMaybe(
    await db.from('subac_sessions').select('*').eq('id', id).maybeSingle(),
  );
}

/** Fetches one participant row by id within a Subac session. */
export async function getSubacParticipant(
  db: DbClient,
  subacSessionId: string,
  participantId: string,
): Promise<null | SubacParticipant> {
  return unwrapMaybe(
    await db
      .from('subac_participants')
      .select('*')
      .eq('id', participantId)
      .eq('subac_session_id', subacSessionId)
      .maybeSingle(),
  );
}

/** Lists the saved rotation order with student names attached. */
export async function listSubacParticipants(
  db: DbClient,
  subacSessionId: string,
): Promise<SubacParticipantWithStudent[]> {
  const participants = unwrapList(
    await db
      .from('subac_participants')
      .select('*')
      .eq('subac_session_id', subacSessionId)
      .order('position'),
  );

  if (participants.length === 0) {
    return [];
  }

  const students = unwrapList(
    await db
      .from('students')
      .select('*')
      .in(
        'id',
        participants.map((participant) => participant.student_id),
      ),
  );
  const studentsById = new Map(
    students.map((student) => [student.id, student] as const),
  );

  return participants.map((participant) => {
    const student = studentsById.get(participant.student_id);

    if (!student) {
      throw new Error('Expected participant student row but found none');
    }

    return {
      ...participant,
      student: {
        id: student.id,
        name: student.name,
      },
    };
  });
}

/** Inserts a Subac session and returns its id. */
export async function insertSubacSession(
  db: DbClient,
  values: SubacSessionInsert,
): Promise<string> {
  const session = unwrapSingle(
    await db.from('subac_sessions').insert(values).select('id').single(),
  );
  return session.id;
}

/** Inserts the saved student order for a Subac session. */
export async function insertSubacParticipants(
  db: DbClient,
  values: SubacParticipantInsert[],
): Promise<void> {
  if (values.length === 0) {
    return;
  }

  expectOk(await db.from('subac_participants').insert(values));
}

/** Deletes a Subac session and its saved participants. */
export async function deleteSubacSession(
  db: DbClient,
  id: string,
): Promise<void> {
  expectOk(await db.from('subac_sessions').delete().eq('id', id));
}

/** Persists the live total mistake count for an active Subac session. */
export async function updateSubacSessionMistakeCount(
  db: DbClient,
  id: string,
  mistakeCount: number,
): Promise<void> {
  expectOk(
    await db
      .from('subac_sessions')
      .update({ mistake_count: mistakeCount })
      .eq('id', id)
      .is('ended_at', null),
  );
}

/** Persists one student's live mistake count for an active Subac session. */
export async function updateSubacParticipantMistakeCount(
  db: DbClient,
  id: string,
  subacSessionId: string,
  mistakeCount: number,
): Promise<void> {
  expectOk(
    await db
      .from('subac_participants')
      .update({ mistake_count: mistakeCount })
      .eq('id', id)
      .eq('subac_session_id', subacSessionId),
  );
}

/** Persists the currently highlighted reciter position. */
export async function updateSubacCurrentPosition(
  db: DbClient,
  id: string,
  currentRotationPosition: number,
): Promise<void> {
  expectOk(
    await db
      .from('subac_sessions')
      .update({ current_rotation_position: currentRotationPosition })
      .eq('id', id)
      .is('ended_at', null),
  );
}

/** Ends a Subac session, preserving the final totals. */
export async function endSubacSession(
  db: DbClient,
  id: string,
  values: {
    currentRotationPosition?: number;
    mistakeCount?: number;
  } = {},
): Promise<SubacSession> {
  const updateValues: {
    current_rotation_position?: number;
    ended_at: string;
    mistake_count?: number;
  } = {
    ended_at: new Date().toISOString(),
  };

  if (values.currentRotationPosition !== undefined) {
    updateValues.current_rotation_position = values.currentRotationPosition;
  }

  if (values.mistakeCount !== undefined) {
    updateValues.mistake_count = values.mistakeCount;
  }

  return unwrapSingle(
    await db
      .from('subac_sessions')
      .update(updateValues)
      .eq('id', id)
      .select('*')
      .single(),
  );
}
