-- Phase 3: per-IP rate limiting for the /api/submit Route Handler.
-- Re-runnable (idempotent): safe to apply to an existing DB.
--
-- Covers:
--   1. rate_limits table — one row per IP, tracking a request count within
--      the current time window.
--   2. check_rate_limit(), an atomic check-and-increment the Route Handler
--      calls via RPC before doing any real work (duplicate check, image
--      upload, insert).
--
-- Why this lives in the DB and not app memory: /api/submit is deployed on
-- Vercel as serverless functions, not one long-running process. A JS
-- variable holding a counter would not persist between invocations — the
-- next request can hit a fresh instance with no memory of the last one.
-- The counter has to live somewhere shared and durable.

------------------------------------------------------------------------------
-- 1. rate_limits table.
--    RLS enabled with NO policies: anon/authenticated get zero access (both
--    GRANT and RLS deny by default), matching activities_submissions'
--    posture. service_role bypasses RLS entirely, and check_rate_limit()
--    below runs as the table owner (SECURITY DEFINER), so neither needs an
--    explicit policy to read/write this table.
------------------------------------------------------------------------------

create table if not exists public.rate_limits (
  ip           text primary key,
  count        int not null default 1,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;

------------------------------------------------------------------------------
-- 2. check_rate_limit(p_ip, p_max_requests, p_window_seconds) returns boolean.
--
--    Does the read, window-check, and increment as a SINGLE statement
--    (INSERT ... ON CONFLICT DO UPDATE) so Postgres serializes concurrent
--    calls for the same IP itself. A separate "select count, then update"
--    from the Node side would race: two near-simultaneous requests could
--    both read count=4 (under a cap of 5) before either write lands, and
--    both would be allowed through.
--
--    SECURITY DEFINER: same reasoning as reset_activities_submissions_id_seq()
--    below it in the prior migration — runs as the function owner so
--    service_role can call it without needing direct table grants.
------------------------------------------------------------------------------

create or replace function public.check_rate_limit(
  p_ip text,
  p_max_requests int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limits (ip, count, window_start)
  values (p_ip, 1, now())
  on conflict (ip) do update
    set count = case
          when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then 1
          else public.rate_limits.count + 1
        end,
        window_start = case
          when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then now()
          else public.rate_limits.window_start
        end
  returning count into v_count;

  return v_count <= p_max_requests;
end;
$$;
