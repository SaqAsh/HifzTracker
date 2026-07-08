import type { DbClient } from '@/lib/data/client';
import { expectOk, unwrapList, unwrapSingle } from '@/lib/data/unwrap';
import type {
  Lesson,
  LessonInsert,
  LessonStatus,
  LessonUpdate,
} from '@/lib/database.types';
import { LESSON_STATUS } from '@/lib/statuses';

/** Lists lessons for a set of students, ordered by schedule. */
export async function listLessonsForStudents(
  db: DbClient,
  studentIds: string[],
): Promise<Lesson[]> {
  if (studentIds.length === 0) {
    return [];
  }

  return unwrapList(
    await db
      .from('lessons')
      .select('*')
      .in('student_id', studentIds)
      .order('scheduled_at'),
  );
}

/** Lists lessons for one student in the requested chronological order. */
export async function listLessonsForStudent(
  db: DbClient,
  studentId: string,
  options: { ascending: boolean },
): Promise<Lesson[]> {
  return unwrapList(
    await db
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_at', { ascending: options.ascending }),
  );
}

/** Fetches a single lesson by id, throwing when missing. */
export async function getLesson(db: DbClient, id: string): Promise<Lesson> {
  return unwrapSingle(
    await db.from('lessons').select('*').eq('id', id).single(),
  );
}

/** Inserts a scheduled lesson. */
export async function insertLesson(
  db: DbClient,
  values: LessonInsert,
): Promise<void> {
  expectOk(await db.from('lessons').insert(values));
}

/** Deletes a lesson by id. */
export async function deleteLesson(db: DbClient, id: string): Promise<void> {
  expectOk(await db.from('lessons').delete().eq('id', id));
}

/** Updates a scheduled lesson and returns the persisted row. */
export async function updateLesson(
  db: DbClient,
  id: string,
  values: LessonUpdate,
): Promise<Lesson> {
  return unwrapSingle(
    await db.from('lessons').update(values).eq('id', id).select('*').single(),
  );
}

/** Updates a lesson's status by id. */
export async function setLessonStatus(
  db: DbClient,
  id: string,
  status: LessonStatus,
): Promise<void> {
  expectOk(await db.from('lessons').update({ status }).eq('id', id));
}

/** Marks a lesson completed. */
export async function completeLesson(db: DbClient, id: string): Promise<void> {
  await setLessonStatus(db, id, LESSON_STATUS.COMPLETED);
}
