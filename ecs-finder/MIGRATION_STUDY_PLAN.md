# Supabase Migration — Study & Build Plan

Companion to `PROPOSED_DATA_ARCHITECTURE.md`. Each step: watch a video, then do something concrete in the project. Tick the boxes as you go.

Search the video titles verbatim on YouTube — they're standard terms; any recent, well-viewed video works. When a video's code differs from what we write here, treat the video as "what concept exists" and ask why ours is different — that gap is where the real learning is.

---

## Step 1 — Async JavaScript

- [ ] **Watch:** "JavaScript fetch API and async await"
- [ ] **Do:** In any browser console (F12), fetch a fake API:

  ```js
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  const data = await res.json();
  console.log(data);
  ```

- [ ] **Do:** Break it on purpose — change the URL to garbage, wrap in `try/catch`, see what an error looks like.

**Done when:** you can explain in one sentence what `await` does on each of those two lines.

## Step 2 — The fetch-in-React pattern

- [ ] **Watch:** "React fetch data useEffect loading error state"
- [ ] **Do:** Make a throwaway `src/components/FetchPractice.tsx`, render it temporarily in `App.tsx`. Fetch the same fake API and render three states: "Loading…", an error message, and the list of user names. Delete the component when done.

**Done when:** you refresh and briefly *see* the loading state before the names appear.

## Step 3 — Supabase basics

- [ ] **Watch:** "Supabase React crash course" (skim the auth sections for now)
- [ ] **Do:** Create a free project at supabase.com named `ecs-finder`.
- [ ] **Do:** In the Table Editor, create an `activities` table with columns matching the `Activity` type in `src/types.ts`, plus `status` and `created_at`.
- [ ] **Do:** Hand-enter 2–3 activities from `src/data/Activities.ts` as rows (real seed script comes in Phase 1).

**Done when:** you can see your rows in the dashboard and can say what the anon key vs. the service-role key are (Settings → API).

## Step 4 — Reading-level SQL, then BUILD PHASE 1

- [ ] **Watch:** "SQL basics select insert where" (15–30 min is enough)
- [ ] **Build Phase 1 (with Claude):** install `@supabase/supabase-js`, write the real seed script, add the RLS read-only policy, switch `ActivityCards` from importing `mockActivities` to fetching — using the loading/error pattern from Step 2.

## Step 5 — Forms

- [ ] **Watch:** "React forms controlled components"
- [ ] **Do:** Read `src/components/SearchBar.tsx` and point at the "controlled" part (value from state, onChange writes state). The submission form is that pattern × ten fields.

**Done when:** SearchBar looks obvious to you.

## Step 6 — Row Level Security (concept only, no coding)

- [ ] **Watch:** "Supabase Row Level Security explained"
- [ ] **Do:** Re-read the RLS section of `PROPOSED_DATA_ARCHITECTURE.md`, then answer without looking: *why must the public key have zero insert access, even though we want public submissions?*

**Done when:** you can answer that unprompted — it's the security model of the whole pipeline.

## Step 7 — Edge Functions, then BUILD PHASE 2

- [ ] **Watch:** "Supabase Edge Functions tutorial" (note: they run on Deno — looks almost exactly like Node, don't let it throw you)
- [ ] **Build Phase 2 (with Claude):** in-app form page + Edge Function with the hard checks (format, duplicate); submissions land as `flagged`.

## Phase 3 — no homework

Turnstile (CAPTCHA), rate limiting, and the Claude content check are small enough to learn while building them.

---

**Pacing:** Steps 1–2 in one sitting if possible (one continuous idea), Step 3 in another, then build Phase 1. Don't binge all seven videos before building anything — the "Done when" checkpoints are the actual point, and building Phase 1 early makes videos 5–7 land much better.
