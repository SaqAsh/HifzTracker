import { NextResponse, type NextRequest } from 'next/server';
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

  const { data: isTeacher } = await supabase.rpc('is_teacher', {
    uid: user.id,
  });

  if (isTeacher) {
    return NextResponse.redirect(new URL('/lessons', request.url));
  }

  const { data: existingStudent } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existingStudent) {
    await supabase
      .from('students')
      .update({ user_id: user.id })
      .is('user_id', null)
      .eq('email', user.email.toLowerCase())
      .select('id')
      .maybeSingle();
  }

  const { data: claimedStudent } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!claimedStudent) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL('/student/login?error=not_on_file', request.url),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
