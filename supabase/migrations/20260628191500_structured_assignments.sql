alter table public.lessons
  add column if not exists assignment_type text not null default 'lesson',
  add column if not exists lesson_surah_number integer,
  add column if not exists lesson_ayah_from integer,
  add column if not exists lesson_ayah_to integer,
  add column if not exists revision_mode text,
  add column if not exists revision_juz_from integer,
  add column if not exists revision_juz_to integer,
  add column if not exists revision_hizb_from integer,
  add column if not exists revision_hizb_to integer,
  add column if not exists revision_surah_from integer,
  add column if not exists revision_surah_to integer;

alter table public.lessons
  drop column if exists notes;

do $$
begin
  alter table public.lessons
    add constraint lessons_assignment_type_check
    check (assignment_type in ('lesson', 'revision'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_revision_mode_check
    check (revision_mode is null or revision_mode in ('juz', 'hizb', 'surah_range'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_lesson_surah_number_check
    check (lesson_surah_number is null or lesson_surah_number between 1 and 114);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_lesson_ayah_from_check
    check (lesson_ayah_from is null or lesson_ayah_from > 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_lesson_ayah_to_check
    check (lesson_ayah_to is null or lesson_ayah_to > 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_revision_juz_from_check
    check (revision_juz_from is null or revision_juz_from between 1 and 30);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_revision_juz_to_check
    check (revision_juz_to is null or revision_juz_to between 1 and 30);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_revision_hizb_from_check
    check (revision_hizb_from is null or revision_hizb_from between 1 and 60);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_revision_hizb_to_check
    check (revision_hizb_to is null or revision_hizb_to between 1 and 60);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_revision_surah_from_check
    check (revision_surah_from is null or revision_surah_from between 1 and 114);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lessons
    add constraint lessons_revision_surah_to_check
    check (revision_surah_to is null or revision_surah_to between 1 and 114);
exception
  when duplicate_object then null;
end $$;
