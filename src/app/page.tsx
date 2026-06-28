import { redirect } from 'next/navigation';
import { isTeacher } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/** Routes signed-in users to their app area. */
export default async function Home(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  redirect((await isTeacher(user.id)) ? '/lessons' : '/student');
}
