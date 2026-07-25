# Proposed Architecture — Automated Submission Pipeline (Supabase)

Status: **decided, not yet implemented.** This replaces the manual Google Form → Sheet → `npm run sync` → manual push flow with a fully automated Supabase-backed pipeline.

## Goals

1. Automatically validate incoming submissions (duplicates, broken links, spam/low-quality content).
2. Automatically publish approved activities — no manual sync, commit, or deploy step.
3. Instant publishing: an approved activity is visible on the site immediately.
4. Secondary but real: learn Supabase, and make the project a stronger portfolio piece. Future direction: user accounts / auth (Supabase Auth), which this architecture sets up for.

## Decisions (previously open questions)

| Question | Decision |
|---|---|
| Human-in-the-loop or auto-approve? | **Auto-approve** if all checks pass. Submissions that fail a *soft* check (link liveness, Claude content check) are stored as `flagged` for human review instead of being rejected — nothing legitimate gets silently dropped. Everything is logged and revertible. |
| Where does the form live? | **In-app React form** (new page/route in this app), posting to the Edge Function. The Google Form is retired. Building the form is deliberate React practice. |
| Admin UI? | **None at first.** Reviewing `flagged` rows and reverting bad activities is done in the Supabase dashboard (Studio) — a spreadsheet-like table editor, zero code. Build an in-app admin page later only if dashboard editing gets annoying (it pairs naturally with adding auth). |

## Architecture

### 1. Data layer: Supabase

A Supabase (hosted Postgres) table `activities` with the same fields as the current `Activity` type, plus:

- `status`: `'approved' | 'flagged' | 'rejected'` — no `pending` state, because passing all checks auto-approves.
- `created_at`, and the raw submission payload kept for audit/revert.

**Row Level Security (RLS) — important, this was wrong in the first draft:**

- The public (anon key) gets **read-only access to `status = 'approved'` rows. No insert, no update, ever.**
- All writes go through the Edge Function, which runs server-side with the secret service-role key.
- Rationale: the anon key ships in the JS bundle and is public by design. If RLS allowed public inserts, anyone could POST rows straight to the Supabase REST API and bypass the CAPTCHA, rate limits, and every validation check. The Edge Function is only a real gate if it's the *only* write path.

The React app fetches approved rows at runtime instead of importing a static array. This requires adding **loading and error states** to the card grid (the static site never needed them) — treat that as part of the migration, not an afterthought.

### 2. Submission intake: in-app form → Edge Function

A new form page in the React app collects the same fields as the old Google Form. It posts to a Supabase **Edge Function** (a small server-side script Supabase hosts and runs on demand) — the single validation gate.

### 3. Validation (in the Edge Function)

Runs cheapest-first. Checks are either **hard** (fail = reject with an error shown to the submitter) or **soft** (fail = store as `flagged` for human review — because these checks have false positives):

1. **Format checks** *(hard)* — required fields present, link is a well-formed URL, category/topic/subtopic match the tag registry.
2. **Duplicate check** *(hard)* — exact or fuzzy name match against existing rows (a SQL query now, not a regex over a file).
3. **Link liveness** *(soft)* — fetch the submitted link. Soft because Facebook pages and Google Forms — the most common registration links for Vietnamese student activities — routinely block automated requests even when the link is fine. A fetch failure means "a human should glance at this," not "reject."
4. **Claude content check** *(soft)* — send name/description/link to Claude (Haiku — simple classification, ~$0.001/submission) for a structured verdict: legitimate vs. spam/gibberish, and validate the description reads sensibly. Soft for the same reason: flag, don't discard.
   - Prompt-injection note: submission text is untrusted. Quote it clearly as data in the prompt, and the model's output can only ever set a flag/fields — it must not be able to trigger any other action.

Outcome: hard-fail → rejected with feedback; all pass → `approved` (live instantly); soft-fail → `flagged`, reviewed by hand in the dashboard.

**No derived visual fields.** `acronym` and `accent` were removed from the model — cards and the detail modal both show the activity's **photo**, so `image` is now a **required** field. The form must require an image, and format checks (step 1) should treat a missing or non-image URL as a hard fail. Topic accent colors still exist in the frontend for pills/hover, but they're looked up from the topic in code, never stored per activity.

**Tag registry sharing:** the Edge Function can't import `src/data/tagData.ts` from the frontend bundle. Either move the registry to a shared location both can import, or (simpler) store topics/categories in a small Supabase table that both the app and the function read. Decide during implementation; do not hand-duplicate the list in two places.

### 4. Anti-spam safeguards (in front of validation)

- **CAPTCHA** on the form — Cloudflare Turnstile (free, simpler than reCAPTCHA), verified inside the Edge Function.
- **Rate limiting** — cap submissions per IP per hour. Edge Functions are stateless, so counts live in a small Supabase table the function checks/increments.
- **Cheap-checks-first ordering** — free checks run before the paid Claude call.
- **Hard daily cap** on Claude API calls (a counter in the same rate-limit table) as a failsafe.

### 5. Publish

No publish step exists. `status = 'approved'` ⇒ visible on next page load. Reverting a bad activity = flipping its status in the dashboard.

## Migration plan (one-time)

1. Create the `activities` table and RLS policies.
2. Seed it from the current `mockActivities` array in `src/data/Activities.ts` (a one-off script).
3. Switch the app to fetch from Supabase, with loading/error UI.
4. **Delete `Activities.ts` and `scripts/sync.js`** once the fetch path works — two sources of truth is how data bugs happen.
5. Retire the Google Form/Sheet after the in-app form ships.

## Suggested build order (incremental, each phase leaves the site working)

- **Phase 1 — read path:** table + RLS + seed script; app fetches approved rows; loading/error states. *Learn: Supabase client, async data in React.*
- **Phase 2 — write path:** in-app form + Edge Function with hard checks (format, duplicate) only. Submissions land as `flagged` initially (everything human-reviewed while trust is built). *Learn: Edge Functions, service-role vs anon key.*
- **Phase 3 — automation & hardening:** Turnstile, rate limiting, link check, Claude check; flip to auto-approve once the checks have been watched on real submissions for a while.
- **Later:** Supabase Auth + in-app admin page.

## What this replaces

| Current | Proposed |
|---|---|
| Google Form + Sheet | In-app form → Edge Function → Supabase `activities` table |
| Manual review of Sheet rows | Automated checks; only soft-flagged rows reviewed by hand |
| `npm run sync` (manual, currently broken) | Deleted |
| git commit + push of data file | Not needed — dynamic fetch |
| Vercel deploy on data changes | Deploys only on code changes |

## Costs

- Supabase free tier comfortably covers this scale (500 MB database, 500K Edge Function invocations/month).
- Claude (Haiku) content check: ~**$0.001 per submission** — under $1/month even at 1,000 submissions, and spam safeguards keep volume honest.

## Accepted trade-offs

- The site gains a runtime dependency (Supabase down/slow ⇒ cards don't load) and needs loading/error UI. Accepted in exchange for instant publishing, full automation, and the learning/portfolio value.
- Auto-approve means a well-formed, plausible-sounding but bad submission can go live until someone notices. Mitigated by soft-flagging, full logging, and one-click revert in the dashboard.
