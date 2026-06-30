# Quran Teacher MVP

A lightweight Next.js/Supabase app for one Quran teacher to manage students,
schedule lessons, run a live mistake counter, and give students a passwordless
read-only lesson portal.

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
# Required — the app throws on startup if any of these are unset
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

# Optional — defaults to http://localhost:3000 when unset
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get the keys from your Supabase dashboard under Project Settings → API Keys.
The publishable key (`sb_publishable_...`) is safe for the browser; the secret
key (`sb_secret_...`) is server-only, bypasses RLS, and must never be committed
or exposed to the client.

`NEXT_PUBLIC_SITE_URL` is optional locally since it falls back to
`http://localhost:3000`, but you should set it in production so Supabase magic
links redirect back to the correct URL.

Run the Supabase migrations in `supabase/migrations/` against your project in
filename order. Then create the teacher in Supabase Auth and insert one matching
row into `public.settings`:

```sql
insert into public.settings (teacher_id, max_mistakes_per_session)
values ('TEACHER_AUTH_USER_ID', 5);
```

Start the app:

```bash
npm run dev
```

## Supabase Notes

Students use `/student/login` and Supabase magic links. On first login, the app
claims the matching `public.students` row by email and links it to the student's
Auth user id. If no row matches, the app signs them out and shows a clear error.

No notification delivery is implemented in this MVP. `notification_status` is
reserved for future WhatsApp/SMS work.

## Deploy

Deploy to Vercel and set the same environment variables there, with
`NEXT_PUBLIC_SITE_URL` set to the Vercel URL so magic links return to production.

Use Safari's Share Sheet to add the site to an iPhone home screen and verify it
opens standalone with the Quran icon.
