'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type {
  AssignmentType,
  LessonStatus,
  RevisionMode,
  StudentStatus,
} from '@/lib/database.types';
import { requireTeacher } from '@/lib/auth';
import { getSurah } from '@/lib/quran';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { nullableText, positiveInteger, requiredText } from '@/lib/strings';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function redirectBack(formData: FormData, fallback: string): never {
  const returnTo = formData.get('returnTo');
  redirect(
    typeof returnTo === 'string' && returnTo.length > 0 ? returnTo : fallback,
  );
}

type LessonAssignmentPayload = {
  assignment_type: AssignmentType;
  lesson_ayah_from: null | number;
  lesson_ayah_to: null | number;
  lesson_surah_number: null | number;
  revision_hizb_from: null | number;
  revision_hizb_to: null | number;
  revision_juz_from: null | number;
  revision_juz_to: null | number;
  revision_mode: null | RevisionMode;
  revision_surah_from: null | number;
  revision_surah_to: null | number;
};

function optionalInteger(
  formData: FormData,
  key: string,
  min: number,
  max: number,
): null | number {
  const rawValue = formData.get(key);
  const text = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (text.length === 0) {
    return null;
  }

  const value = Number(text);

  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${key} must be between ${min} and ${max}`);
  }

  return value;
}

function requiredInteger(
  formData: FormData,
  key: string,
  min: number,
  max: number,
): number {
  const value = optionalInteger(formData, key, min, max);

  if (!value) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value;
}

function validateRange(from: number, to: null | number, label: string): void {
  if (to && from > to) {
    throw new Error(`${label} start must be before the end`);
  }
}

function parseAssignment(formData: FormData): LessonAssignmentPayload {
  const assignmentType = requiredText(
    formData,
    'assignmentType',
  ) as AssignmentType;

  if (assignmentType === 'lesson') {
    const lessonSurahNumber = requiredInteger(
      formData,
      'lessonSurahNumber',
      1,
      114,
    );
    const surah = getSurah(lessonSurahNumber);

    if (!surah) {
      throw new Error('Invalid surah');
    }

    const lessonAyahFrom = optionalInteger(
      formData,
      'lessonAyahFrom',
      1,
      surah.ayahCount,
    );
    const lessonAyahTo = optionalInteger(
      formData,
      'lessonAyahTo',
      1,
      surah.ayahCount,
    );

    if (lessonAyahFrom && lessonAyahTo) {
      validateRange(lessonAyahFrom, lessonAyahTo, 'Ayah range');
    }

    return {
      assignment_type: 'lesson',
      lesson_ayah_from: lessonAyahFrom,
      lesson_ayah_to: lessonAyahTo,
      lesson_surah_number: lessonSurahNumber,
      revision_hizb_from: null,
      revision_hizb_to: null,
      revision_juz_from: null,
      revision_juz_to: null,
      revision_mode: null,
      revision_surah_from: null,
      revision_surah_to: null,
    };
  }

  const revisionMode = requiredText(formData, 'revisionMode') as RevisionMode;

  if (revisionMode === 'juz') {
    const from = requiredInteger(formData, 'revisionJuzFrom', 1, 30);
    const to = optionalInteger(formData, 'revisionJuzTo', 1, 30);
    validateRange(from, to, 'Juz range');

    return revisionAssignment({
      revision_juz_from: from,
      revision_juz_to: to,
      revision_mode: 'juz',
    });
  }

  if (revisionMode === 'hizb') {
    const from = requiredInteger(formData, 'revisionHizbFrom', 1, 60);
    const to = optionalInteger(formData, 'revisionHizbTo', 1, 60);
    validateRange(from, to, 'Hizb range');

    return revisionAssignment({
      revision_hizb_from: from,
      revision_hizb_to: to,
      revision_mode: 'hizb',
    });
  }

  const from = requiredInteger(formData, 'revisionSurahFrom', 1, 114);
  const to = optionalInteger(formData, 'revisionSurahTo', 1, 114);
  validateRange(from, to, 'Surah range');

  return revisionAssignment({
    revision_mode: 'surah_range',
    revision_surah_from: from,
    revision_surah_to: to,
  });
}

function revisionAssignment(
  values: Partial<LessonAssignmentPayload> & { revision_mode: RevisionMode },
): LessonAssignmentPayload {
  return {
    assignment_type: 'revision',
    lesson_ayah_from: null,
    lesson_ayah_to: null,
    lesson_surah_number: null,
    revision_hizb_from: values.revision_hizb_from ?? null,
    revision_hizb_to: values.revision_hizb_to ?? null,
    revision_juz_from: values.revision_juz_from ?? null,
    revision_juz_to: values.revision_juz_to ?? null,
    revision_mode: values.revision_mode,
    revision_surah_from: values.revision_surah_from ?? null,
    revision_surah_to: values.revision_surah_to ?? null,
  };
}

/** Signs in the teacher with email/password Supabase auth. */
export async function signInTeacher(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const email = normalizeEmail(requiredText(formData, 'email'));
  const password = requiredText(formData, 'password');
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/login?error=invalid');
  }

  redirect('/lessons');
}

/** Sends a passwordless student magic link. */
export async function sendStudentMagicLink(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const email = normalizeEmail(requiredText(formData, 'email'));
  const requestHeaders = await headers();
  const origin =
    requestHeaders.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/student`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect('/student/login?error=send_failed');
  }

  redirect('/student/login?sent=1');
}

/** Signs a student in with email and password. */
export async function signInStudentWithPassword(
  formData: FormData,
): Promise<void> {
  const supabase = await createClient();
  const email = normalizeEmail(requiredText(formData, 'email'));
  const password = requiredText(formData, 'password');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect('/student/login?error=invalid_credentials');
  }

  // Link user_id to the student row if not already linked.
  if (data.user) {
    await supabase
      .from('students')
      .update({ user_id: data.user.id })
      .is('user_id', null)
      .eq('email', email);
  }

  redirect('/student');
}

/** Signs the current user out. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/** Creates a student owned by the signed-in teacher. */
export async function createStudent(formData: FormData): Promise<void> {
  const { user } = await requireTeacher();
  const supabase = await createClient();
  const email = normalizeEmail(requiredText(formData, 'email'));
  const password = nullableText(formData.get('password'));
  const startDate = requiredText(formData, 'startDate');

  // Create an auth user for the student if a password was provided.
  let studentUserId: string | null = null;
  if (password) {
    const admin = createAdminClient();
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (authError && !authError.message.includes('already been registered')) {
      throw new Error(authError.message);
    }
    if (authData?.user) {
      studentUserId = authData.user.id;
    } else {
      // User already exists — look up their id.
      const { data: users } = await admin.auth.admin.listUsers();
      const existing = users?.users.find((u) => u.email === email);
      if (existing) studentUserId = existing.id;
    }
  }

  const { error } = await supabase.from('students').insert({
    email,
    name: requiredText(formData, 'name'),
    notes: nullableText(formData.get('notes')),
    phone: nullableText(formData.get('phone')),
    start_date: startDate,
    teacher_id: user.id,
    ...(studentUserId ? { user_id: studentUserId } : {}),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/students');
  redirect('/students');
}

/** Updates an existing student. */
export async function updateStudent(formData: FormData): Promise<void> {
  await requireTeacher();
  const supabase = await createClient();
  const studentId = requiredText(formData, 'studentId');
  const status = requiredText(formData, 'status') as StudentStatus;
  const email = normalizeEmail(requiredText(formData, 'email'));
  const password = nullableText(formData.get('password'));

  // Update or create auth user password if provided.
  if (password) {
    const admin = createAdminClient();
    const { data: users } = await admin.auth.admin.listUsers();
    const existing = users?.users.find((u) => u.email === email);
    if (existing) {
      await admin.auth.admin.updateUserById(existing.id, { password });
    } else {
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    }
  }

  const { error } = await supabase
    .from('students')
    .update({
      email,
      name: requiredText(formData, 'name'),
      notes: nullableText(formData.get('notes')),
      phone: nullableText(formData.get('phone')),
      start_date: requiredText(formData, 'startDate'),
      status,
    })
    .eq('id', studentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/students');
  redirect(`/students/${studentId}`);
}

/** Archives a student without deleting history. */
export async function archiveStudent(formData: FormData): Promise<void> {
  await requireTeacher();
  const supabase = await createClient();
  const studentId = requiredText(formData, 'studentId');
  const { error } = await supabase
    .from('students')
    .update({ status: 'inactive' })
    .eq('id', studentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/students');
  redirect('/students');
}

/** Updates the teacher's default mistake cap. */
export async function updateSettings(formData: FormData): Promise<void> {
  const { user } = await requireTeacher();
  const supabase = await createClient();
  const { error } = await supabase
    .from('settings')
    .update({
      max_mistakes_per_session: positiveInteger(
        formData,
        'maxMistakesPerSession',
      ),
    })
    .eq('teacher_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/settings');
  redirect('/settings?saved=1');
}

/** Schedules a lesson for a student. */
export async function createLesson(formData: FormData): Promise<void> {
  await requireTeacher();
  const supabase = await createClient();
  const scheduledAt = requiredText(formData, 'scheduledAt');
  const assignment = parseAssignment(formData);
  const { error } = await supabase.from('lessons').insert({
    ...assignment,
    max_mistakes: positiveInteger(formData, 'maxMistakes'),
    scheduled_at: new Date(scheduledAt).toISOString(),
    student_id: requiredText(formData, 'studentId'),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/lessons');
  redirectBack(formData, '/lessons');
}

/** Marks a lesson completed or cancelled. */
export async function updateLessonStatus(formData: FormData): Promise<void> {
  await requireTeacher();
  const supabase = await createClient();
  const lessonId = requiredText(formData, 'lessonId');
  const status = requiredText(formData, 'status') as LessonStatus;
  const { error } = await supabase
    .from('lessons')
    .update({ status })
    .eq('id', lessonId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/lessons');
  redirectBack(formData, '/lessons');
}

/** Starts a session from a scheduled lesson. */
export async function startLessonSession(formData: FormData): Promise<void> {
  await requireTeacher();
  const supabase = await createClient();
  const lessonId = requiredText(formData, 'lessonId');
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (lessonError) {
    throw new Error(lessonError.message);
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      lesson_id: lesson.id,
      max_mistakes_snapshot: lesson.max_mistakes,
      student_id: lesson.student_id,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/sessions/${session.id}`);
}

/** Starts an ad hoc session using the teacher's default mistake cap. */
export async function startAdHocSession(formData: FormData): Promise<void> {
  const { settings } = await requireTeacher();
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      max_mistakes_snapshot: settings.max_mistakes_per_session,
      student_id: requiredText(formData, 'studentId'),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/sessions/${session.id}`);
}

/** Persists the current live mistake count for an active session. */
export async function setMistakeCount(
  sessionId: string,
  mistakeCount: number,
): Promise<void> {
  await requireTeacher();
  const supabase = await createClient();
  const { error } = await supabase
    .from('sessions')
    .update({ mistake_count: Math.max(0, Math.trunc(mistakeCount)) })
    .eq('id', sessionId)
    .is('ended_at', null);

  if (error) {
    throw new Error(error.message);
  }
}

/** Ends a session and completes its linked lesson when present. */
export async function endSession(
  sessionId: string,
  mistakeCount: number,
): Promise<void> {
  await requireTeacher();
  const supabase = await createClient();
  const finalCount = Math.max(0, Math.trunc(mistakeCount));
  const { data: session, error } = await supabase
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      mistake_count: finalCount,
    })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (session.lesson_id) {
    await supabase
      .from('lessons')
      .update({ status: 'completed' })
      .eq('id', session.lesson_id);
  }

  revalidatePath(`/students/${session.student_id}`);
  redirect(`/students/${session.student_id}`);
}
