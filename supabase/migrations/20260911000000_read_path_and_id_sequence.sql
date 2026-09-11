-- Database-side setup for activities_submissions that lives only in Supabase,
-- not in application code. Re-runnable (idempotent): safe to apply to an existing DB.
--
-- Covers:
--   1. Read-path access for the public site (GRANT + RLS policy).
--   2. reset_activities_submissions_id_seq(), which scripts/seed.ts calls after
--      seeding to realign the id sequence.
--
-- Assumes the activities_submissions table already exists (created via the
-- Supabase Table Editor). This file does not (re)create it.

------------------------------------------------------------------------------
-- 1. Read path: anon/authenticated may read only approved rows.
--    Two independent gates guard every query — GRANT (table-level) and RLS
--    (row-level). With RLS on and no matching policy, selects return zero rows
--    and NO error, so the site renders an empty grid with nothing in the logs.
------------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.activities_submissions to anon, authenticated;

alter table public.activities_submissions enable row level security;

-- Drop-then-create so this file stays re-runnable (CREATE POLICY errors if it exists).
drop policy if exists "public can read approved activities" on public.activities_submissions;

create policy "public can read approved activities"
  on public.activities_submissions for select
  to anon, authenticated
  using (status = 'approved');

-- Deliberately NO insert policy: public submissions go through the /api/submit
-- Route Handler using the service-role key, never straight from the browser.

------------------------------------------------------------------------------
-- 2. id sequence realignment.
--    npm run seed upserts rows with explicit ids (from mockActivities), which
--    does NOT advance the id sequence. Later inserts that omit id (the
--    /api/submit Route Handler) then collide with existing ids:
--      23505 duplicate key value violates unique constraint "activities-submissions_pkey"
--    This function resets the sequence to max(id)+1. seed.ts calls it via RPC
--    after every upsert so the sequence can't drift out of sync.
--
--    SECURITY DEFINER: runs as the function owner. service_role cannot setval
--    the sequence directly (42501 permission denied for sequence), so an
--    INVOKER-rights function would fail when called from the seed script.
------------------------------------------------------------------------------

create or replace function public.reset_activities_submissions_id_seq()
returns bigint
language sql
security definer
set search_path = public
as $$
  select setval(
    pg_get_serial_sequence('activities_submissions', 'id'),
    coalesce((select max(id) from public.activities_submissions), 0) + 1,
    false
  );
$$;
