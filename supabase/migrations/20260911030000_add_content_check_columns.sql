-- Phase 3: Claude content check result, for human review of pending rows.
-- Re-runnable (idempotent): safe to apply to an existing DB.
--
-- /api/submit sends each submission's text to Claude (Haiku) for a spam/
-- legitimacy and appropriateness classification. Verdicts:
--   'ok'      - looks like a real activity
--   'spam'    - looks fake/junk/an ad (SOFT: still saved as pending)
--   'review'  - genuinely ambiguous, needs a human look (SOFT: still saved as pending)
--   null      - not yet checked, or the check itself failed (fails open)
--
-- 'inappropriate' verdicts never reach this table: those submissions are
-- rejected before the insert happens, so no row is ever created for them.
-- content_check_reason is Claude's one-sentence explanation, for whoever
-- reviews pending rows in the dashboard.

alter table public.activities_submissions
  add column if not exists content_check_verdict text,
  add column if not exists content_check_reason text;
