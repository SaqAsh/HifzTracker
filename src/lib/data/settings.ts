import type { DbClient } from '@/lib/data/client';
import { expectOk, unwrapMaybe } from '@/lib/data/unwrap';
import type { Settings } from '@/lib/database.types';

/** Fetches the teacher settings row, or null when not configured. */
export async function getSettings(
  db: DbClient,
  teacherId: string,
): Promise<null | Settings> {
  return unwrapMaybe(
    await db
      .from('settings')
      .select('*')
      .eq('teacher_id', teacherId)
      .limit(1)
      .maybeSingle(),
  );
}

/** Updates the teacher's default mistake cap. */
export async function updateMaxMistakes(
  db: DbClient,
  teacherId: string,
  maxMistakesPerSession: number,
): Promise<void> {
  expectOk(
    await db
      .from('settings')
      .update({ max_mistakes_per_session: maxMistakesPerSession })
      .eq('teacher_id', teacherId),
  );
}

/** Returns whether an auth user is registered as a teacher. */
export async function checkIsTeacher(
  db: DbClient,
  userId: string,
): Promise<boolean> {
  const { data } = await db.rpc('is_teacher', { uid: userId });
  return Boolean(data);
}
