import { NextResponse, type NextRequest } from 'next/server';
import { checkIsTeacher } from '@/lib/data/settings';
import { claimStudentByEmail, getStudentByUserId } from '@/lib/data/students';
import { createClient } from '@/lib/supabase/server';

/** Handles Supabase auth redirects and routes by identity. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (await checkIsTeacher(supabase, user.id)) {
    return NextResponse.redirect(new URL('/lessons', request.url));
  }

  let student = await getStudentByUserId(supabase, user.id);

  if (!student) {
    await claimStudentByEmail(supabase, user.email.toLowerCase(), user.id);
    student = await getStudentByUserId(supabase, user.id);
  }

  if (!student) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL('/student/login?error=not_on_file', request.url),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
