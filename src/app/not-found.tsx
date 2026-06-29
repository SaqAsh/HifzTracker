import Link from 'next/link';
import { AppLogo } from '@/components/app-logo';
import { primaryButtonClassName } from '@/components/forms';

/** Branded 404 shown for unmatched routes and notFound() calls. */
export default function NotFound(): React.JSX.Element {
  return (
    <main className="safe-screen grid place-items-center px-4 py-8">
      <section className="w-full max-w-sm rounded-[2rem] border border-teal/15 bg-cream p-6 text-center shadow-sm">
        <div className="mb-6 grid justify-items-center gap-4">
          <AppLogo size="lg" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sand">
              Not found
            </p>
            <h1 className="font-serif text-4xl font-semibold text-teal">
              Page not found
            </h1>
          </div>
        </div>
        <p className="mb-6 text-sm text-ink/60">
          The page you are looking for does not exist or has moved.
        </p>
        <Link className={`${primaryButtonClassName} w-full`} href="/">
          Go home
        </Link>
      </section>
    </main>
  );
}
