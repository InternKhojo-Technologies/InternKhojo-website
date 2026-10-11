-- Hire daily scoring — single-table JSONB architecture.
-- Run with: supabase db push  (or paste into Supabase Dashboard > SQL Editor)
--
-- Design: ONLY ONE table (hire_daily_attempts). The old per-question
-- `hire_question_submissions` table was dropped to avoid row bloat; answers
-- live in the `submissions` JSONB column as an array of:
--   [{ "mongo_id": string, "selected_answer": string, "is_correct": boolean }]
--
-- API contract (app/api/hire/*):
--   POST /api/hire/submit    SINGLE INSERT with total_score, total_time_ms,
--                            submissions, is_completed=true. Returns review.
--   GET  /api/hire/attempt   reads submissions JSONB, hydrates from MongoDB
--                            via $in (ObjectId) for the review payload.
--   GET  /api/hire/questions deterministic daily 10 (seed = category+date).

-- Required for gen_random_uuid() on self-hosted Postgres.
-- (No-op on Supabase cloud where pgcrypto is already enabled.)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Drop the legacy per-question table (row bloat). Safe on fresh DBs.
-- ---------------------------------------------------------------------------
drop table if exists public.hire_question_submissions cascade;

-- ---------------------------------------------------------------------------
-- hire_daily_attempts (the ONLY hire table)
-- ---------------------------------------------------------------------------
create table if not exists public.hire_daily_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  attempt_date date not null default CURRENT_DATE,
  total_score integer not null default 0,
  total_time_ms bigint not null default 0,
  is_completed boolean not null default true,
  submissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint hire_daily_attempts_submissions_is_array
    check (jsonb_typeof(submissions) = 'array')
);

-- UNIQUE constraint on (user_id, category, attempt_date): one attempt per
-- user/category/day. POST /api/hire/submit relies on this for idempotency
-- (returns 409 on duplicates).
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

-- Legacy partial index from the two-table era — superseded by the UNIQUE
-- constraint above. Drop so exactly one enforcement path remains.
drop index if exists hire_daily_attempts_one_per_day_idx;

create index if not exists hire_daily_attempts_leaderboard_idx
  on public.hire_daily_attempts (category, attempt_date, is_completed, total_score desc, total_time_ms asc);

create index if not exists hire_daily_attempts_user_idx
  on public.hire_daily_attempts (user_id, is_completed, attempt_date desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The app uses the anon key + user JWT (lib/supabase-server.ts), so every
-- query runs as `authenticated` with auth.uid() = caller.
--   - SELECT: own rows + any completed row (leaderboard needs other users').
--   - INSERT: own rows only (with check auth.uid() = user_id).
-- ---------------------------------------------------------------------------
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
