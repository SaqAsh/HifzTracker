<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Architecture

Quran Teacher is a Next.js 16 App Router application backed by Supabase Auth and
Postgres. It is a single-teacher classroom tool for scheduling hifz lessons,
running live mistake counters, managing students, and running Subac group
revision rotations.

## App Shape

- Teacher routes live under `src/app/(teacher)/`.
- Public login routes are `src/app/login/page.tsx` and
  `src/app/student/login/page.tsx`.
- Student portal routes live under `src/app/student/`.
- Mutations are server actions in `src/app/actions.ts`.
- Database reads/writes should go through `src/lib/data/*` helpers.
- Supabase client creation belongs in `src/lib/supabase/server.ts` or
  `src/lib/supabase/browser.ts`.
- Shared form/button/card styles live in `src/components/forms.tsx`.

## Auth Model

- Teachers sign in with Supabase email/password at `/login`.
- Students sign in with Supabase email/password at `/student/login`.
- There are no magic links, OTP sign-ins, or auth callback routes in this app.
  Do not reintroduce `signInWithOtp`, `emailRedirectTo`, or `/auth/callback`
  unless the product direction changes.
- Student Auth users can be created when a teacher sets a student password.
  On first password login, the app links the matching `public.students` row to
  the student's Auth user id by email.
- `SUPABASE_SECRET_KEY` is used only server-side for admin operations such as
  creating student Auth users.

## Lesson Flow

- A scheduled lesson card has one primary action: `Start`.
- The lesson edit control is a small icon button pinned to the top-right of the
  card; the edit form expands inside the card.
- Lessons are completed only by ending a started session. Do not add direct
  `Complete` or `Cancel` card actions.
- Deleting a lesson is reserved for cleanup of incorrect lesson rows and removes
  sessions linked to that lesson id.

## Subac Flow

- Active Subac sessions are controlled from the live rotation screen.
- A Subac session is finished through `finishSubacSession`, which persists the
  final local counter state and sets `ended_at`.
- Subac delete is available only for completed sessions. The server action also
  guards against deleting a live Subac session from a stale/direct form post.

## UI Conventions

- Shared button classes are full-width by default.
- Buttons inside cards should generally use the shared button classes directly.
- Keep operational screens dense and direct; avoid marketing-page copy inside
  the app.
- Prefer existing components and helpers over adding new local patterns.

## Database Notes

- The generated Supabase types are in `src/lib/database.types.ts`.
- Keep migrations in `supabase/migrations/`.
- Existing lesson status values still include legacy `cancelled` in the database
  type/check, but the UI no longer exposes cancellation.
