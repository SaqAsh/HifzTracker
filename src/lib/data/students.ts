import type { DbClient } from '@/lib/data/client';
import { expectOk, unwrapList, unwrapMaybe } from '@/lib/data/unwrap';
import type {
  Student,
  StudentInsert,
  StudentUpdate,
} from '@/lib/database.types';
import { STUDENT_STATUS } from '@/lib/statuses';

/** Lists every student for the roster, ordered by name. */
export async function listStudents(db: DbClient): Promise<Student[]> {
  return unwrapList(await db.from('students').select('*').order('name'));
}

/** Lists students who are not archived, ordered by name. */
export async function listActiveStudents(db: DbClient): Promise<Student[]> {
  return unwrapList(
    await db
      .from('students')
      .select('*')
      .neq('status', STUDENT_STATUS.INACTIVE)
      .order('name'),
  );
}

/** Fetches a single student by id, or null when missing. */
export async function getStudent(
  db: DbClient,
  id: string,
): Promise<null | Student> {
  return unwrapMaybe(
    await db.from('students').select('*').eq('id', id).maybeSingle(),
  );
}

/** Fetches the student linked to an auth user, or null when unlinked. */
export async function getStudentByUserId(
  db: DbClient,
  userId: string,
): Promise<null | Student> {
  return unwrapMaybe(
    await db.from('students').select('*').eq('user_id', userId).maybeSingle(),
  );
}

/** Inserts a new student row. */
export async function insertStudent(
  db: DbClient,
  values: StudentInsert,
): Promise<void> {
  expectOk(await db.from('students').insert(values));
}

/** Updates a student row by id. */
export async function updateStudent(
  db: DbClient,
  id: string,
  values: StudentUpdate,
): Promise<void> {
  expectOk(await db.from('students').update(values).eq('id', id));
}

/** Archives a student without deleting history. */
export async function archiveStudent(db: DbClient, id: string): Promise<void> {
  expectOk(
    await db
      .from('students')
      .update({ status: STUDENT_STATUS.INACTIVE })
      .eq('id', id),
  );
}

/** Links an unclaimed student row (matched by email) to an auth user. */
export async function claimStudentByEmail(
  db: DbClient,
  email: string,
  userId: string,
): Promise<void> {
  await db
    .from('students')
    .update({ user_id: userId })
    .is('user_id', null)
    .eq('email', email);
}
