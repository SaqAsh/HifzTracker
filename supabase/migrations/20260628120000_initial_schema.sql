create extension if not exists pgcrypto;

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id),
  max_mistakes_per_session integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id),
  user_id uuid unique references auth.users(id),
  name text not null,
  phone text,
  email text not null unique,
  start_date date not null default current_date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  constraint students_status_check check (status in ('active', 'paused', 'inactive'))
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  scheduled_at timestamptz not null,
  max_mistakes integer not null,
  assignment_type text not null default 'lesson',
  lesson_surah_number integer,
  lesson_ayah_from integer,
  lesson_ayah_to integer,
  revision_mode text,
  revision_juz_from integer,
  revision_juz_to integer,
  revision_hizb_from integer,
  revision_hizb_to integer,
  revision_surah_from integer,
  revision_surah_to integer,
  status text not null default 'scheduled',
  notification_status text not null default 'not_sent',
  created_at timestamptz not null default now(),
  constraint lessons_assignment_type_check check (assignment_type in ('lesson', 'revision')),
  constraint lessons_revision_mode_check check (revision_mode is null or revision_mode in ('juz', 'hizb', 'surah_range')),
  constraint lessons_status_check check (status in ('scheduled', 'completed', 'cancelled')),
  constraint lessons_notification_status_check check (notification_status in ('not_sent', 'sent')),
  constraint lessons_max_mistakes_check check (max_mistakes > 0),
  constraint lessons_lesson_surah_number_check check (lesson_surah_number is null or lesson_surah_number between 1 and 114),
  constraint lessons_lesson_ayah_from_check check (lesson_ayah_from is null or lesson_ayah_from > 0),
  constraint lessons_lesson_ayah_to_check check (lesson_ayah_to is null or lesson_ayah_to > 0),
  constraint lessons_revision_juz_from_check check (revision_juz_from is null or revision_juz_from between 1 and 30),
  constraint lessons_revision_juz_to_check check (revision_juz_to is null or revision_juz_to between 1 and 30),
  constraint lessons_revision_hizb_from_check check (revision_hizb_from is null or revision_hizb_from between 1 and 60),
  constraint lessons_revision_hizb_to_check check (revision_hizb_to is null or revision_hizb_to between 1 and 60),
  constraint lessons_revision_surah_from_check check (revision_surah_from is null or revision_surah_from between 1 and 114),
  constraint lessons_revision_surah_to_check check (revision_surah_to is null or revision_surah_to between 1 and 114)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_id uuid references public.lessons(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  mistake_count integer not null default 0,
  max_mistakes_snapshot integer not null,
  created_at timestamptz not null default now(),
  constraint sessions_mistake_count_check check (mistake_count >= 0),
  constraint sessions_max_mistakes_snapshot_check check (max_mistakes_snapshot > 0)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

create or replace function public.is_teacher(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (select 1 from public.settings where teacher_id = uid);
$$;

alter table public.students enable row level security;
alter table public.lessons enable row level security;
alter table public.sessions enable row level security;
alter table public.settings enable row level security;

create policy "teacher full access students" on public.students
  for all using (public.is_teacher(auth.uid()) and teacher_id = auth.uid())
  with check (public.is_teacher(auth.uid()) and teacher_id = auth.uid());

create policy "teacher full access lessons" on public.lessons
  for all using (
    public.is_teacher(auth.uid())
    and student_id in (select id from public.students where teacher_id = auth.uid())
  )
  with check (
    public.is_teacher(auth.uid())
    and student_id in (select id from public.students where teacher_id = auth.uid())
  );

create policy "teacher full access sessions" on public.sessions
  for all using (
    public.is_teacher(auth.uid())
    and student_id in (select id from public.students where teacher_id = auth.uid())
  )
  with check (
    public.is_teacher(auth.uid())
    and student_id in (select id from public.students where teacher_id = auth.uid())
  );

create policy "teacher full access settings" on public.settings
  for all using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "student reads own row" on public.students
  for select using (user_id = auth.uid());

create policy "student claims own row" on public.students
  for update using (user_id is null and email = auth.jwt() ->> 'email')
  with check (user_id = auth.uid());

create policy "student reads own lessons" on public.lessons
  for select using (
    student_id in (select id from public.students where user_id = auth.uid())
  );

create index students_teacher_id_idx on public.students(teacher_id);
create index students_user_id_idx on public.students(user_id);
create index lessons_student_id_scheduled_at_idx on public.lessons(student_id, scheduled_at);
create index sessions_student_id_started_at_idx on public.sessions(student_id, started_at);
