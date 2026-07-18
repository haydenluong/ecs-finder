# Proposed Architecture — Automated Submission Pipeline

Status: **proposed / not yet implemented.** This document captures the target architecture discussed for automating activity submissions, replacing the current manual Google Form → Sheet → `npm run sync` → manual push flow.

## Goals

1. Automatically validate incoming submissions (duplicates, broken links, spam/low-quality content).
2. Automatically publish approved activities without a manual `npm run sync` + push step.

## Current state (for reference)

Google Form → Google Sheet (manual `Status = approved`) → `npm run sync` (run by hand) → commits `Activities.jsx` → git push → Vercel auto-deploy.

See `CLAUDE.md` for full detail on the existing pipeline and its known bug (`sync.js` still points at the stale `mockActivities.jsx` filename).

## Proposed architecture

### 1. Data layer: Supabase

Replace `Activities.jsx` (a JS array baked into the build) with a Supabase (hosted Postgres) table, e.g. `activities`, with a `status` column: `pending` / `approved` / `rejected`.

- Row Level Security (RLS) restricts writes: anyone can insert as `pending`; only an authenticated admin role can change `status` or read pending rows.
- The React app fetches `status = 'approved'` rows at runtime instead of importing a static array — activities go live the moment a row is approved, no rebuild or deploy.

### 2. Submission intake

The submission form (in-app or existing Google Form, TBD) posts to a Supabase Edge Function instead of writing directly to the table. That function is the validation gate.

### 3. Automated validation (in the Edge Function)

Runs before a submission is stored, in order from cheapest to most expensive:

1. **Format checks** — required fields present, link is a well-formed URL, category/tag values match `tagData.jsx`'s registry.
2. **Duplicate check** — exact or fuzzy match against existing activity names.
3. **Link liveness** — fetch the submitted link, confirm it resolves (not a dead link).
4. **Claude API content check** — send the title/description/link to Claude, ask for a structured `{ approve: boolean, reason: string }` verdict on whether the submission looks legitimate (not spam, not gibberish, actually describes what it claims). Uses a cheap model (Haiku) since this is a simple classification task — estimated cost is well under a cent per submission.

Only submissions that pass all four are stored (as `pending`, awaiting human approval — see Open Questions).

### 4. Anti-spam safeguards (in front of validation)

Because step 3.4 costs real (if small) money per call, and because floods of junk submissions are a risk regardless of cost:

- **CAPTCHA** on the submission form — blocks most bots before they ever reach the backend.
- **Rate limiting** — cap submissions per IP/email per hour.
- **Cheap-checks-first ordering** — steps 3.1–3.3 (free) run before 3.4 (paid), so junk is filtered out before any API cost is incurred.
- **Hard daily cap** on Claude API calls as a failsafe against unexpected volume.

### 5. Approval

Undecided — see Open Questions below. Either a human reviews `pending` rows and flips them to `approved`, or (if validation is trusted enough) passing all checks auto-approves.

### 6. Publish

No separate "push" step — because the site reads live from Supabase, the moment a row's `status` becomes `approved`, it's visible on the site. No git commit, no rebuild, no deploy.

## What this replaces

| Current | Proposed |
|---|---|
| Google Sheet | Supabase `activities` table |
| Manual review of Sheet rows | Automated validation (+ optional human approval step) |
| `npm run sync` (manual, currently broken) | Not needed — no static file to regenerate |
| git commit + push of `Activities.jsx` | Not needed — dynamic fetch from Supabase |
| Vercel deploy triggered by data changes | Deploys only happen on code changes, not data changes |

## Open questions (not yet decided)

- **Human-in-the-loop or fully automatic approval?** Automated checks catch broken/duplicate/spammy submissions but not necessarily bad judgment calls (inappropriate-but-well-formed content). Leaning toward: auto-approve if all checks pass, but log everything so it can be reviewed/reverted after the fact — a middle ground between full manual review and zero oversight.
- **Where does the submission form live?** Either replace the Google Form with an in-app form posting to Supabase, or keep the Google Form and bridge it into Supabase.
- **Admin UI** for reviewing/reverting activities — a page in the existing app, or a separate internal tool.

## Cost estimate

Per-submission Claude API cost (Haiku, cheapest suitable model): roughly **$0.0009** (well under a tenth of a cent) for a typical title + description. Even at 1,000 submissions/month, total cost is under $1 — validation cost is not expected to be a meaningful expense, provided spam safeguards are in place.
