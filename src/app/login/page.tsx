import Link from 'next/link';
import { signInTeacher } from '@/app/actions';
import { AppLogo } from '@/components/app-logo';
import {
  Field,
  fieldClassName,
  primaryButtonClassName,
} from '@/components/forms';

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** Teacher email/password login page. */
export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const hasError = params?.error === 'invalid';
  const hasTeacherSetupError = params?.error === 'teacher_setup';

  return (
    <main className="safe-screen grid place-items-center px-4 py-8">
      <section className="w-full max-w-sm rounded-[2rem] border border-teal/15 bg-cream p-6 shadow-sm">
        <div className="mb-8 grid justify-items-center gap-4 text-center">
          <AppLogo size="lg" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sand">
              Quran Teacher
            </p>
            <h1 className="font-serif text-4xl font-semibold text-teal">
              Teacher Login
            </h1>
          </div>
        </div>

        {hasError ? (
          <p className="mb-4 rounded-2xl bg-maroon px-4 py-3 text-sm font-semibold text-cream">
            Invalid email or password.
          </p>
        ) : null}
        {hasTeacherSetupError ? (
          <p className="mb-4 rounded-2xl bg-maroon px-4 py-3 text-sm font-semibold text-cream">
            This login is valid, but no matching teacher settings row was found
            in Supabase.
          </p>
        ) : null}

        <form action={signInTeacher} className="grid gap-4">
          <Field label="Email">
            <input
              className={fieldClassName}
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Password">
            <input
              className={fieldClassName}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <button className={primaryButtonClassName} type="submit">
            Sign in
          </button>
        </form>

        <Link
          href="/student/login"
          className="mt-5 block text-center text-sm font-semibold text-teal"
        >
          Student magic-link login
        </Link>
      </section>
    </main>
  );
}
