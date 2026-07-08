'use server';

import { randomInt } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireTeacher } from '@/lib/auth';
import { siteUrl } from '@/lib/env';
import {
  completeLesson,
  deleteLesson as deleteLessonRow,
  getLesson,
  insertLesson,
  setLessonStatus,
  updateLesson as updateLessonRow,
} from '@/lib/data/lessons';
import {
  deleteSessionsForLesson,
  endSession as endSessionRow,
  insertSession,
} from '@/lib/data/sessions';
import { updateMaxMistakes } from '@/lib/data/settings';
import {
  deleteSubacSession as deleteSubacSessionRow,
  endSubacSession as endSubacSessionRow,
  getSubacSession,
  insertSubacParticipants,
  insertSubacSession,
  listSubacParticipants,
  updateSubacParticipantMistakeCount,
} from '@/lib/data/subac';
import {
  archiveStudent as archiveStudentRow,
  claimStudentByEmail,
  insertStudent,
  listActiveStudents,
  updateStudent as updateStudentRow,
} from '@/lib/data/students';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import {
  createStudentSchema,
  credentialsSchema,
  emailSchema,
  lessonIdSchema,
  lessonStatusSchema,
  parseCreateLesson,
  parseCreateSubac,
  parseForm,
  parseUpdateLesson,
  settingsSchema,
  studentIdSchema,
  subacSessionIdSchema,
  updateStudentSchema,
} from '@/lib/validation';

/** Accepts only same-site relative paths to prevent open redirects. */
function isSafeReturnPath(value: FormDataEntryValue | null): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith('/\\')
  );
}

function redirectBack(formData: FormData, fallback: string): never {
  const returnTo = formData.get('returnTo');
  redirect(isSafeReturnPath(returnTo) ? returnTo : fallback);
}

function shuffled<T>(values: T[]): T[] {
  const copy = [...values];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function nonNegativeInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

/** Signs in the teacher with email/password Supabase auth. */
export async function signInTeacher(formData: FormData): Promise<void> {
  const { email, password } = parseForm(formData, credentialsSchema);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/login?error=invalid');
  }

  redirect('/lessons');
}

/** Sends a passwordless student magic link. */
export async function sendStudentMagicLink(formData: FormData): Promise<void> {
  const { email } = parseForm(formData, emailSchema);
  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin') ?? siteUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/student`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect('/student/login?error=invalid');
  }

  redirect('/student/login?sent=1');
}

/** Signs a student in with email and password. */
export async function signInStudentWithPassword(
  formData: FormData,
): Promise<void> {
  const { email, password } = parseForm(formData, credentialsSchema);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect('/student/login?error=invalid');
  }

  if (data.user) {
    await claimStudentByEmail(supabase, email, data.user.id);
  }

  redirect('/student');
}

/** Signs the current user out. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

const USERS_PER_PAGE = 1000;
const MAX_USER_PAGES = 100;

/** Finds an existing auth user id by email, paging through all users. */
async function findAuthUserIdByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<null | string> {
  for (let page = 1; page <= MAX_USER_PAGES; page += 1) {
    const { data } = await admin.auth.admin.listUsers({
      page,
      perPage: USERS_PER_PAGE,
    });
    const users = data?.users ?? [];
    const match = users.find((user) => user.email === email);

    if (match) {
      return match.id;
    }

    if (users.length < USERS_PER_PAGE) {
      break;
    }
  }

  return null;
}

/** Ensures an auth user exists for the email and returns its id when created. */
async function ensureStudentAuthUser(
  email: string,
  password: string,
): Promise<null | string> {
  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  });

  if (created?.user) {
    return created.user.id;
  }

  if (error && !error.message.includes('already been registered')) {
    throw new Error(error.message);
  }

  return findAuthUserIdByEmail(admin, email);
}

/** Creates a student owned by the signed-in teacher. */
export async function createStudent(formData: FormData): Promise<void> {
  const { user } = await requireTeacher();
  const input = parseForm(formData, createStudentSchema);
  const supabase = await createClient();
  const studentUserId = input.password
    ? await ensureStudentAuthUser(input.email, input.password)
    : null;

  await insertStudent(supabase, {
    email: input.email,
    name: input.name,
    notes: input.notes,
    phone: input.phone,
    start_date: input.startDate,
    teacher_id: user.id,
    ...(studentUserId ? { user_id: studentUserId } : {}),
  });

  revalidatePath('/students');
  redirect('/students');
}

/** Updates an existing student. */
export async function updateStudent(formData: FormData): Promise<void> {
  await requireTeacher();
  const input = parseForm(formData, updateStudentSchema);
  const supabase = await createClient();

  if (input.password) {
    await ensureStudentAuthUser(input.email, input.password);
  }

  await updateStudentRow(supabase, input.studentId, {
    email: input.email,
    name: input.name,
    notes: input.notes,
    phone: input.phone,
    start_date: input.startDate,
    status: input.status,
  });

  revalidatePath('/students');
  redirect(`/students/${input.studentId}`);
}

/** Archives a student without deleting history. */
export async function archiveStudent(formData: FormData): Promise<void> {
  await requireTeacher();
  const { studentId } = parseForm(formData, studentIdSchema);
  const supabase = await createClient();
  await archiveStudentRow(supabase, studentId);

  revalidatePath('/students');
  redirect('/students');
}

/** Updates the teacher's default mistake cap. */
export async function updateSettings(formData: FormData): Promise<void> {
  const { user } = await requireTeacher();
  const { maxMistakesPerSession } = parseForm(formData, settingsSchema);
  const supabase = await createClient();
  await updateMaxMistakes(supabase, user.id, maxMistakesPerSession);

  revalidatePath('/settings');
  redirect('/settings?saved=1');
}

/** Schedules a lesson for a student. */
export async function createLesson(formData: FormData): Promise<void> {
  await requireTeacher();
  const { assignment, maxMistakes, scheduledAt, studentId } =
    parseCreateLesson(formData);
  const supabase = await createClient();
  await insertLesson(supabase, {
    ...assignment,
    max_mistakes: maxMistakes,
    scheduled_at: new Date(scheduledAt).toISOString(),
    student_id: studentId,
  });

  revalidatePath('/lessons');
  revalidatePath(`/students/${studentId}`);
  redirectBack(formData, '/lessons');
}

/** Updates an existing scheduled lesson. */
export async function updateLesson(formData: FormData): Promise<void> {
  await requireTeacher();
  const { assignment, lessonId, maxMistakes, scheduledAt, studentId } =
    parseUpdateLesson(formData);
  const supabase = await createClient();
  const previousLesson = await getLesson(supabase, lessonId);
  const lesson = await updateLessonRow(supabase, lessonId, {
    ...assignment,
    max_mistakes: maxMistakes,
    scheduled_at: new Date(scheduledAt).toISOString(),
    student_id: studentId,
  });

  revalidatePath('/lessons');
  revalidatePath(`/students/${previousLesson.student_id}`);
  revalidatePath(`/students/${lesson.student_id}`);
  redirectBack(formData, '/lessons');
}

/** Marks a lesson completed or cancelled. */
export async function updateLessonStatus(formData: FormData): Promise<void> {
  await requireTeacher();
  const { lessonId, status } = parseForm(formData, lessonStatusSchema);
  const supabase = await createClient();
  await setLessonStatus(supabase, lessonId, status);
  const lesson = await getLesson(supabase, lessonId);

  revalidatePath('/lessons');
  revalidatePath(`/students/${lesson.student_id}`);
  redirectBack(formData, '/lessons');
}

/** Deletes an incorrect lesson that is not tied to a completed session. */
export async function deleteLesson(formData: FormData): Promise<void> {
  await requireTeacher();
  const { lessonId } = parseForm(formData, lessonIdSchema);
  const supabase = await createClient();
  const lesson = await getLesson(supabase, lessonId);
  await deleteSessionsForLesson(supabase, lessonId);
  await deleteLessonRow(supabase, lessonId);

  revalidatePath('/lessons');
  revalidatePath(`/students/${lesson.student_id}`);
  redirectBack(formData, '/lessons');
}

/** Starts a session from a scheduled lesson. */
export async function startLessonSession(formData: FormData): Promise<void> {
  await requireTeacher();
  const { lessonId } = parseForm(formData, lessonIdSchema);
  const supabase = await createClient();
  const lesson = await getLesson(supabase, lessonId);
  const sessionId = await insertSession(supabase, {
    lesson_id: lesson.id,
    max_mistakes_snapshot: lesson.max_mistakes,
    student_id: lesson.student_id,
  });

  redirect(`/sessions/${sessionId}`);
}

/** Starts an ad hoc session using the teacher's default mistake cap. */
export async function startAdHocSession(formData: FormData): Promise<void> {
  const { settings } = await requireTeacher();
  const { studentId } = parseForm(formData, studentIdSchema);
  const supabase = await createClient();
  const sessionId = await insertSession(supabase, {
    max_mistakes_snapshot: settings.max_mistakes_per_session,
    student_id: studentId,
  });

  redirect(`/sessions/${sessionId}`);
}

/** Ends a session and completes its linked lesson when present. */
export async function endSession(
  sessionId: string,
  mistakeCount: number,
): Promise<void> {
  await requireTeacher();
  const supabase = await createClient();
  const session = await endSessionRow(
    supabase,
    sessionId,
    Math.max(0, Math.trunc(mistakeCount)),
  );

  if (session.lesson_id) {
    await completeLesson(supabase, session.lesson_id);
    revalidatePath('/lessons');
  }

  revalidatePath(`/students/${session.student_id}`);
  redirect(`/students/${session.student_id}`);
}

/** Starts a Subac group session with a randomized saved student order. */
export async function startSubacSession(formData: FormData): Promise<void> {
  const { user } = await requireTeacher();
  const input = parseCreateSubac(formData);
  const supabase = await createClient();
  const activeStudents = await listActiveStudents(supabase);
  const activeById = new Map(
    activeStudents.map((student) => [student.id, student] as const),
  );
  const selectedStudents = input.studentIds.map((studentId) =>
    activeById.get(studentId),
  );

  if (selectedStudents.some((student) => !student)) {
    throw new Error('Subac students must be active students in your roster');
  }

  const orderedStudents = shuffled(
    selectedStudents.filter((student) => student !== undefined),
  );
  const subacSessionId = await insertSubacSession(supabase, {
    max_mistakes_snapshot: input.maxMistakes,
    portion_label: input.portionLabel,
    teacher_id: user.id,
  });

  await insertSubacParticipants(
    supabase,
    orderedStudents.map((student, index) => ({
      position: index + 1,
      student_id: student.id,
      subac_session_id: subacSessionId,
    })),
  );

  revalidatePath('/subac');
  redirect(`/subac/${subacSessionId}`);
}

type FinalSubacParticipantCount = {
  id: string;
  mistakeCount: number;
};

type FinalSubacState = {
  currentPosition: number;
  participants: FinalSubacParticipantCount[];
  totalMistakes: number;
};

/** Ends a Subac group session and persists the final local counter state. */
export async function finishSubacSession(
  subacSessionId: string,
  finalState: FinalSubacState,
): Promise<void> {
  await requireTeacher();
  const supabase = await createClient();
  const session = await getSubacSession(supabase, subacSessionId);

  if (
    !session ||
    session.ended_at ||
    !finalState ||
    typeof finalState !== 'object' ||
    !Array.isArray(finalState.participants)
  ) {
    return;
  }

  const participants = await listSubacParticipants(supabase, subacSessionId);
  const nextPosition = nonNegativeInteger(Number(finalState.currentPosition));
  const submittedCounts = new Map<string, number>();

  for (const participant of finalState.participants) {
    if (!participant || typeof participant.id !== 'string') {
      return;
    }

    submittedCounts.set(
      participant.id,
      nonNegativeInteger(Number(participant.mistakeCount)),
    );
  }

  if (
    nextPosition < 1 ||
    submittedCounts.size !== participants.length ||
    !participants.some((participant) => participant.position === nextPosition)
  ) {
    return;
  }

  const finalCounts = participants.map((participant) => ({
    participant,
    mistakeCount: submittedCounts.get(participant.id),
  }));

  if (finalCounts.some(({ mistakeCount }) => mistakeCount === undefined)) {
    return;
  }

  const totalMistakes = finalCounts.reduce(
    (total, { mistakeCount }) => total + (mistakeCount ?? 0),
    0,
  );
  const submittedTotal = nonNegativeInteger(Number(finalState.totalMistakes));

  if (
    totalMistakes !== submittedTotal ||
    totalMistakes > session.max_mistakes_snapshot ||
    totalMistakes < session.mistake_count ||
    finalCounts.some(
      ({ mistakeCount, participant }) =>
        (mistakeCount ?? 0) < participant.mistake_count,
    )
  ) {
    return;
  }

  await Promise.all(
    finalCounts.map(({ mistakeCount, participant }) =>
      updateSubacParticipantMistakeCount(
        supabase,
        participant.id,
        subacSessionId,
        mistakeCount ?? 0,
      ),
    ),
  );
  await endSubacSessionRow(supabase, subacSessionId, {
    currentRotationPosition: nextPosition,
    mistakeCount: totalMistakes,
  });

  revalidatePath('/subac');
  revalidatePath(`/subac/${subacSessionId}`);
  redirect(`/subac/${subacSessionId}`);
}

/** Deletes an incorrect Subac session and its participant rows. */
export async function deleteSubacSession(formData: FormData): Promise<void> {
  await requireTeacher();
  const { subacSessionId } = parseForm(formData, subacSessionIdSchema);
  const supabase = await createClient();
  await deleteSubacSessionRow(supabase, subacSessionId);

  revalidatePath('/subac');
  revalidatePath(`/subac/${subacSessionId}`);
  redirect('/subac');
}
