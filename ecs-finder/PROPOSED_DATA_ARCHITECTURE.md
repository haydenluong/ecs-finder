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

## Implementation notes (decisions that would otherwise live in someone's head)

### Keys & environment variables

- Frontend (`.env`, plus the same vars in Vercel → Project Settings → Environment Variables): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. The `VITE_` prefix is required for Vite to expose them to the app. These are safe to ship — the anon key is public by design; RLS is what protects the data.
- Edge Function secrets (set via `supabase secrets set`, never in the repo, never `VITE_`-prefixed): the service-role key (auto-available inside functions) and `ANTHROPIC_API_KEY` (Phase 3).
- `.env` is already gitignored. The service-role key must never appear in frontend code or git in any form.

### Table schema

Postgres convention is `snake_case`; the app's types are `camelCase`. Map at the fetch boundary (one small function converting a DB row → `Activity`), so component code keeps using the existing type untouched.

| Postgres column | Type | Maps to `Activity` field |
|---|---|---|
| `id` | `bigint` identity (auto-generated) | `id` |
| `name` | `text` | `name` |
| `category` | `text` | `category` |
| `topic` | `text` | `topic` |
| `subtopic` | `text` nullable | `subtopic` |
| `location` | `text` | `location` |
| `deadline` | `date` | `deadline` (ISO string) |
| `positions` | `text[]` | `positions` |
| `description` | `text` | `desc` (avoid `desc` as a column name — it's a reserved SQL keyword) |
| `image` | `text` | `image` |
| `link` | `text` | `link` |
| `status` | `text`, one of `approved`/`flagged`/`rejected` | — (not in frontend type) |
| `created_at` | `timestamptz` default `now()` | — |
| `raw_submission` | `jsonb` nullable | — (audit trail, written by the Edge Function) |

### What changes in the React code (and what doesn't)

- New file `src/lib/supabase.ts` — creates the Supabase client once; everything imports from there.
- Fetch **once, in `App.tsx`**, on mount; store rows in state and pass them down to `MainContent`/`ActivityCards` as a prop replacing the `mockActivities` import. Rationale: all filtering/search/pagination stays exactly as it is (client-side over the full array) — the migration swaps the data *source*, not the filter logic. At this catalog's scale (dozens–hundreds of rows), fetching all approved rows in one query is correct; do not add server-side pagination or per-filter queries.
- Loading/error UI lives where the cards render. Keep it simple: a spinner/skeleton state and a "couldn't load activities, retry" state with a button that re-runs the fetch.

### Edge Function gotchas

- **CORS**: the browser will send a preflight `OPTIONS` request before the form's POST. The function must handle `OPTIONS` and return `Access-Control-Allow-Origin` for the site's origin, or every submission will fail with an opaque CORS error. This is the #1 first-deploy stumble.
- Edge Functions run on **Deno**, not Node: imports are URLs/`npm:` specifiers, not bare `node_modules` names.
- Return structured JSON errors (`{ ok: false, field: 'link', message: '…' }`) so the form can show which field failed — hard-check rejections are user-facing feedback, not logs.

### Definitions pinned down

- **Duplicate check** = case-insensitive, whitespace/diacritic-normalized comparison of `name` against all existing rows (any status — a rejected submission resubmitted verbatim should still match). Start with exact-after-normalization; add fuzzy matching only if real dupes slip through.
- **Link liveness** = a `fetch` with a ~5s timeout following redirects; any 2xx/3xx = pass. Timeout, network error, 4xx/5xx = soft-flag (not reject).
- **Claude check** = one message to Haiku (model id `claude-haiku-4-5`) with the submission quoted as data, requesting JSON `{ legitimate: boolean, reason: string }`. Response parse failure = soft-flag, never approve.

### Verification & rollback

- Order of safety during migration: the app keeps importing `Activities.ts` until the Supabase fetch path is verified **on the deployed site** (not just `npm run dev`) — env vars exist in Vercel too, and that's the step people forget. Only then delete `Activities.ts` and `sync.js` (they remain recoverable from git history regardless).
- Keep the seed script in `scripts/` after seeding — it doubles as disaster recovery documentation for the table shape.

## Costs

- Supabase free tier comfortably covers this scale (500 MB database, 500K Edge Function invocations/month).
- Claude (Haiku) content check: ~**$0.001 per submission** — under $1/month even at 1,000 submissions, and spam safeguards keep volume honest.

## Accepted trade-offs

- The site gains a runtime dependency (Supabase down/slow ⇒ cards don't load) and needs loading/error UI. Accepted in exchange for instant publishing, full automation, and the learning/portfolio value.
- Auto-approve means a well-formed, plausible-sounding but bad submission can go live until someone notices. Mitigated by soft-flagging, full logging, and one-click revert in the dashboard.
