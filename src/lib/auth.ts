import { redirect } from 'next/navigation';
import type { Settings } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';

export type AuthenticatedUser = {
  email: string;
  id: string;
};

export type TeacherContext = {
  settings: Settings;
  user: AuthenticatedUser;
};

/** Returns teacher settings when the user is configured as a teacher. */
export async function getTeacherSettings(
  userId: string,
): Promise<null | Settings> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('teacher_id', userId)
    .limit(1)
    .maybeSingle();

  return settings;
}

/** Returns the signed-in user or redirects to teacher login. */
export async function requireUser(): Promise<AuthenticatedUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect('/login');
  }

  return {
    email: user.email,
    id: user.id,
  };
}

/** Returns the active teacher context or redirects away from teacher routes. */
export async function requireTeacher(): Promise<TeacherContext> {
  const user = await requireUser();
  const settings = await getTeacherSettings(user.id);

  if (!settings) {
    redirect('/login?error=teacher_setup');
  }

  return { settings, user };
}

/** Checks whether a user id has a teacher settings row. */
export async function isTeacher(userId: string): Promise<boolean> {
  return (await getTeacherSettings(userId)) !== null;
}
