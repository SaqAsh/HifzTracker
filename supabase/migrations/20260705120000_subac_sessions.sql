create table public.subac_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id),
  portion_label text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  mistake_count integer not null default 0,
  max_mistakes_snapshot integer not null default 5,
  current_rotation_position integer not null default 1,
  created_at timestamptz not null default now(),
  constraint subac_sessions_portion_label_check check (length(trim(portion_label)) > 0),
  constraint subac_sessions_mistake_count_check check (mistake_count >= 0),
  constraint subac_sessions_max_mistakes_snapshot_check check (max_mistakes_snapshot > 0),
  constraint subac_sessions_total_mistakes_cap_check check (mistake_count <= max_mistakes_snapshot),
  constraint subac_sessions_current_rotation_position_check check (current_rotation_position > 0)
);

create table public.subac_participants (
  id uuid primary key default gen_random_uuid(),
  subac_session_id uuid not null references public.subac_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  position integer not null,
  mistake_count integer not null default 0,
  created_at timestamptz not null default now(),
  constraint subac_participants_position_check check (position > 0),
  constraint subac_participants_mistake_count_check check (mistake_count >= 0),
  constraint subac_participants_session_student_unique unique (subac_session_id, student_id),
  constraint subac_participants_session_position_unique unique (subac_session_id, position)
);

grant select, insert, update, delete on public.subac_sessions to authenticated;
grant select, insert, update, delete on public.subac_participants to authenticated;
grant select, insert, update, delete on public.subac_sessions to service_role;
grant select, insert, update, delete on public.subac_participants to service_role;

alter table public.subac_sessions enable row level security;
alter table public.subac_participants enable row level security;

create policy "teacher full access subac sessions" on public.subac_sessions
  for all
  to authenticated
  using (
    public.is_teacher((select auth.uid()))
    and teacher_id = (select auth.uid())
  )
  with check (
    public.is_teacher((select auth.uid()))
    and teacher_id = (select auth.uid())
  );

create policy "teacher full access subac participants" on public.subac_participants
  for all
  to authenticated
  using (
    public.is_teacher((select auth.uid()))
    and subac_session_id in (
      select id from public.subac_sessions
      where teacher_id = (select auth.uid())
    )
  )
  with check (
    public.is_teacher((select auth.uid()))
    and subac_session_id in (
      select id from public.subac_sessions
      where teacher_id = (select auth.uid())
    )
    and student_id in (
      select id from public.students
      where teacher_id = (select auth.uid())
    )
  );

create index subac_sessions_teacher_id_started_at_idx
  on public.subac_sessions(teacher_id, started_at desc);

create index subac_participants_session_position_idx
  on public.subac_participants(subac_session_id, position);

create index subac_participants_student_id_idx
  on public.subac_participants(student_id);
