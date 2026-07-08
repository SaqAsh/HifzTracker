@AGENTS.md

# Claude Working Notes

Use `AGENTS.md` as the source of truth for this repo. The important architecture
constraints are:

- Next.js 16 App Router; read the local docs in `node_modules/next/dist/docs/`
  before changing framework code.
- Supabase Auth/Postgres with server actions in `src/app/actions.ts` and typed
  data helpers in `src/lib/data/*`.
- Email/password auth only. No magic links, OTP login, or `/auth/callback`.
- Lesson cards expose `Start` plus a top-right edit icon. Completion happens
  only when a started session is ended.
- Subac sessions can be deleted only after completion.
- Shared button styles in `src/components/forms.tsx` are full-width by default.
