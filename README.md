# Quran Teacher

Live app: https://hifz-tracker.vercel.app

Quran Teacher is a small classroom app for managing hifz lessons, revision
assignments, and live mistake counting. It is built for a teacher who needs a
fast way to schedule students, run sessions, and let students check their own
upcoming work.

This is not a broad memorization dashboard. It focuses on the day-to-day flow:
who is scheduled, what they are reading, how many mistakes are allowed, and
what happened in the session.

## What It Does

- Keep a student roster with contact details, notes, start dates, and archive
  status.
- Schedule lesson or revision assignments with structured Quran ranges.
- Start a lesson session from the schedule and count mistakes live.
- Mark the linked lesson complete when the session ends.
- Run a Subac group rotation with randomized student order and shared mistake
  cap.
- Give students a read-only portal for their upcoming and past lessons.
- Install cleanly as a mobile web app from Safari or Chrome.

## Tech Stack

- Next.js 16 App Router
- React 19
- Supabase Auth and Postgres
- Supabase SSR client helpers
- Tailwind CSS 4
- Zod validation

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

# Optional. Used for generated metadata. Defaults to http://localhost:3000.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get the Supabase keys from Project Settings -> API Keys. The publishable key is
safe for the browser. The secret key is server-only and must not be exposed to
client code.

Run the migrations in `supabase/migrations/` against your Supabase project in
filename order.

Create the teacher in Supabase Auth, then insert the matching settings row:

```sql
insert into public.settings (teacher_id, max_mistakes_per_session)
values ('TEACHER_AUTH_USER_ID', 5);
```

Start the dev server:

```bash
npm run dev
```

## Login Model

Teachers sign in at `/login` with email and password.

Students sign in at `/student/login` with email and password. The teacher can
set a student password when creating or editing the student. On first login, the
app links the matching `public.students` row to the student's Supabase Auth user
by email.

There are no magic links in the app.

## Useful Commands

```bash
npm run lint
npm run build
```

## Deployment

The app is built for Vercel. Set the same environment variables in Vercel, run
the Supabase migrations, and make sure the teacher Auth user has a matching row
in `public.settings`.

After deployment, open the app on an iPhone and use Safari's Share Sheet to add
it to the home screen. It should launch standalone with the Quran Teacher icon.
