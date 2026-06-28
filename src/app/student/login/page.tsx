import Link from 'next/link';
import { sendStudentMagicLink } from '@/app/actions';
import { AppLogo } from '@/components/app-logo';
import {
  Field,
  fieldClassName,
  primaryButtonClassName,
} from '@/components/forms';

type StudentLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** Passwordless student login page. */
export default async function StudentLoginPage({
  searchParams,
}: StudentLoginPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const sent = params?.sent === '1';
  const notOnFile = params?.error === 'not_on_file';
  const sendFailed = params?.error === 'send_failed';

  return (
    <main className="safe-screen grid place-items-center px-4 py-8">
      <section className="w-full max-w-sm rounded-[2rem] border border-teal/15 bg-cream p-6 shadow-sm">
        <div className="mb-8 grid justify-items-center gap-4 text-center">
          <AppLogo size="lg" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sand">
              Student Portal
            </p>
            <h1 className="font-serif text-4xl font-semibold text-teal">
              Check Lessons
            </h1>
          </div>
        </div>

        {sent ? (
          <p className="mb-4 rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-ink">
            Magic link sent. Open it on this device to continue.
          </p>
        ) : null}
        {notOnFile ? (
          <p className="mb-4 rounded-2xl bg-maroon px-4 py-3 text-sm font-semibold text-cream">
            We do not have that email on file. Ask your teacher to add it.
          </p>
        ) : null}
        {sendFailed ? (
          <p className="mb-4 rounded-2xl bg-maroon px-4 py-3 text-sm font-semibold text-cream">
            Could not send a magic link. Try again.
          </p>
        ) : null}

        <form action={sendStudentMagicLink} className="grid gap-4">
          <Field label="Email on file">
            <input
              className={fieldClassName}
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <button className={primaryButtonClassName} type="submit">
            Send magic link
          </button>
        </form>

        <Link
          href="/login"
          className="mt-5 block text-center text-sm font-semibold text-teal"
        >
          Teacher login
        </Link>
      </section>
    </main>
  );
}
