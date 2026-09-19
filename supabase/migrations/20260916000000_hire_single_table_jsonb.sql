-- Migrate hire scoring from two tables to single-table JSONB.
-- Applies to databases that already ran 20260915000000_hire_scoring.sql
-- in its original two-table form. Idempotent — safe to run multiple times.

-- 1) Add the submissions JSONB column if missing.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'hire_daily_attempts'
      and column_name = 'submissions'
  ) then
    alter table public.hire_daily_attempts
      add column submissions jsonb not null default '[]'::jsonb;
  end if;
end
$$;

-- 2) Enforce array shape.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hire_daily_attempts_submissions_is_array'
      and conrelid = 'public.hire_daily_attempts'::regclass
  ) then
    alter table public.hire_daily_attempts
      add constraint hire_daily_attempts_submissions_is_array
      check (jsonb_typeof(submissions) = 'array');
  end if;
end
$$;

-- 3) Ensure attempt_date has a CURRENT_DATE default (spec schema).
alter table public.hire_daily_attempts
  alter column attempt_date set default CURRENT_DATE;

-- 4) Replace the legacy partial unique index with the full UNIQUE
--    constraint on (user_id, category, attempt_date).
drop index if exists hire_daily_attempts_one_per_day_idx;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hire_daily_attempts_one_per_day'
      and conrelid = 'public.hire_daily_attempts'::regclass
  ) then
    alter table public.hire_daily_attempts
      add constraint hire_daily_attempts_one_per_day
      unique (user_id, category, attempt_date);
  end if;
end
$$;

create index if not exists hire_daily_attempts_leaderboard_idx
  on public.hire_daily_attempts (category, attempt_date, is_completed, total_score desc, total_time_ms asc);

create index if not exists hire_daily_attempts_user_idx
  on public.hire_daily_attempts (user_id, is_completed, attempt_date desc);

-- 5) Drop the legacy per-question table (row bloat).
drop table if exists public.hire_question_submissions cascade;

-- 6) Re-assert RLS: own insert/read + read completed rows for leaderboard.
alter table public.hire_daily_attempts enable row level security;

drop policy if exists "hire_attempts_select" on public.hire_daily_attempts;
create policy "hire_attempts_select"
  on public.hire_daily_attempts for select
  to authenticated
  using (is_completed = true or auth.uid() = user_id);

drop policy if exists "hire_attempts_insert_own" on public.hire_daily_attempts;
create policy "hire_attempts_insert_own"
  on public.hire_daily_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);
