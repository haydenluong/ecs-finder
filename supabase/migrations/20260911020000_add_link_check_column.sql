-- Phase 3: link liveness check result, for human review of pending rows.
-- Re-runnable (idempotent): safe to apply to an existing DB.
--
-- /api/submit fetches each submitted link server-side before saving. This is
-- a SOFT check: Facebook pages and Google Forms (the most common registration
-- links for Vietnamese student activities) routinely block automated
-- requests even when the link is fine for a real visitor, so a failed fetch
-- does not reject the submission. It only records a verdict here so a human
-- reviewing `pending` rows in the dashboard can see it instead of having to
-- click every link by hand. null = not yet checked (covers pre-existing rows).

alter table public.activities_submissions
  add column if not exists link_check_passed boolean;
