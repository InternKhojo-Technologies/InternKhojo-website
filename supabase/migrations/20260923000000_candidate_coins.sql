-- Coins & Rewards — candidate wallets.
-- Run with: supabase db push (or paste into Supabase Dashboard > SQL Editor)
--
-- NOTE: production already has `candidate_coin_wallets` + the
-- `credit_candidate_coins` RPC. Everything below is idempotent (IF NOT
-- EXISTS / only-if-missing) so applying it never overwrites live objects —
-- it only provisions fresh environments.
--
-- App contract:
--   POST /api/hire/submit  credits +1.00 "Quiz Attempt" and +1.50 per correct
--                          answer via the RPC (candidates only, best-effort).
--   GET  /api/coins/wallet reads total_coins + history (own row via RLS).
--   GET  /api/coins/daily-bonus (Vercel cron 23:55 UTC) pays end-of-day rank
--                          bonuses per category via the RPC (service role).
-- Direct client INSERT/UPDATE on this table stays blocked by RLS: no write
-- policies are created for anon/authenticated. Only the SECURITY DEFINER
-- RPC (and the service role) may credit coins.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.candidate_coin_wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  total_coins numeric(12, 2) not null default 0 check (total_coins >= 0),
  history jsonb not null default '[]'::jsonb
    check (jsonb_typeof(history) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidate_coin_wallets enable row level security;

-- Candidates read ONLY their own wallet (balance + audit log).
drop policy if exists "candidate_coins_select_own" on public.candidate_coin_wallets;
create policy "candidate_coins_select_own"
  on public.candidate_coin_wallets for select
  to authenticated
  using (auth.uid() = user_id);

-- Deliberately NO insert/update/delete policies for anon/authenticated:
-- direct wallet writes stay blocked; crediting goes through the RPC below.

-- ---------------------------------------------------------------------------
-- RPC: credit_candidate_coins(target_user_id, coins_to_add, source_label)
-- Created ONLY when missing — never overwrites the live function.
-- Appends one entry (never wipes history) and bumps total_coins atomically.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'credit_candidate_coins'
  ) then
    execute $func$
      create function public.credit_candidate_coins(
        target_user_id uuid,
        coins_to_add numeric,
        source_label text
      )
      returns public.candidate_coin_wallets
      language plpgsql
      security definer
      set search_path = public
      as $body$
      declare
        wallet public.candidate_coin_wallets%ROWTYPE;
        entry jsonb;
      begin
        if target_user_id is null then
          raise exception 'Target user id is required.';
        end if;
        if coins_to_add is null or coins_to_add <= 0 then
          raise exception 'Coins to add must be greater than zero.';
        end if;
        if source_label is null or btrim(source_label) = '' then
          raise exception 'Source label is required.';
        end if;
        entry := jsonb_build_object(
          'coins', round(coins_to_add, 2),
          'source', source_label,
          'created_at', now()
        );
        insert into public.candidate_coin_wallets (user_id, total_coins, history)
        values (target_user_id, round(coins_to_add, 2), jsonb_build_array(entry))
        on conflict (user_id) do update set
          total_coins = round(public.candidate_coin_wallets.total_coins + excluded.total_coins, 2),
          history = coalesce(public.candidate_coin_wallets.history, '[]'::jsonb) || excluded.history,
          updated_at = now()
        returning * into wallet;
        return wallet;
      end;
      $body$;
    $func$;
  end if;
end
$$;
