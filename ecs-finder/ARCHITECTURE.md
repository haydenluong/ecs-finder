# Architecture — Current State

**Status:** Active. This document describes the current production architecture (as of July 2026, after the Next.js migration).

---

## Overview

**ecs-finder** is a **React + TypeScript + Next.js (App Router) web application**. It displays a filterable catalog of extracurricular activities (competitions, clubs, projects) for Vietnamese students.

Activity data still lives in a TypeScript module bundled at build time, and the home page is **prerendered to static HTML on the server** — so activity content is present in the initial HTML and indexable by search engines. Once that HTML reaches the browser it hydrates into the same client-side app as before: filtering, search, pagination and language switching all happen in the browser with no network calls.

There is no backend server yet. `src/app/api/` (Route Handlers) is where one will live when the Supabase submission pipeline is built.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | React 19 + TypeScript 6 |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Rendering** | Static prerender at build time + client hydration |
| **Linting** | ESLint 9 + `eslint-config-next` |
| **Styling** | CSS custom properties + inline styles (Tailwind 4 installed but **unused** — zero `className` in the codebase) |
| **Fonts** | Google Fonts (Montserrat, Be Vietnam Pro) |
| **Icons** | react-icons, lucide-react |
| **Hosting** | Vercel (auto-deploy on git push) |
| **Form ingestion** | Google Sheets + manual `npm run sync` (known broken) |
| **Mobile UI** | Bottom sheet drawer modal (FilterDrawer) |

---

## File Structure

```
ecs-finder/
├── src/
│   ├── app/                        ← App Router. Filenames define routes.
│   │   ├── layout.tsx              ← Root layout: <html>/<body>, metadata, font links, global CSS
│   │   ├── page.tsx                ← The "/" route. SERVER Component — future Supabase fetch goes here
│   │   └── HomeClient.tsx          ← 'use client' boundary. Owns all filter state (was App.tsx)
│   │
│   ├── types.ts                    ← TypeScript interfaces (Activity, Tag, etc.)
│   ├── index.css                   ← Global styles + design tokens (--primary, --text, etc.)
│   │
│   ├── components/
│   │   ├── Navbar.tsx              ← Top bar: logo, links, language toggle
│   │   ├── HeroSection.tsx         ← Banner: headline (typing animation), search, floating chips
│   │   ├── SearchBar.tsx           ← Input field + result count badge
│   │   ├── MainContent.tsx         ← Layout: FilterLeft | ActivityCards
│   │   ├── FilterLeft.tsx          ← Filter sidebar wrapper (desktop)
│   │   ├── FilterDrawer.tsx        ← Mobile bottom-sheet wrapper (≤1080px)
│   │   ├── FilterSections.tsx      ← Filter controls, shared by rail + drawer. Holds hexRgba() helper.
│   │   ├── ActivityCards.tsx       ← Card grid + detail modal + pagination
│   │   └── Footer.tsx              ← Site footer (copy-email button)
│   │
│   ├── data/
│   │   ├── Activities.ts           ← mockActivities array + filterActivities() + daysLeft()
│   │   └── tagData.ts              ← topicSet, categorySet, allTags registries
│   │
│   └── assets/                     ← logo.jpg
│
├── CLAUDE.md                       ← Development guide (commands, architecture overview)
├── ARCHITECTURE.md                 ← This file
├── package.json                    ← Dependencies + npm scripts
├── next.config.ts                  ← Next.js config (currently empty)
├── postcss.config.mjs              ← Tailwind 4 via PostCSS
├── tsconfig.json                   ← TypeScript config (jsx: preserve, @/* → src/*)
└── scripts/
    └── sync.js                     ← Google Sheets sync script (currently broken)
```

**Import alias:** `@/` resolves to `src/`, so `@/components/Navbar` works from any depth.

---

## Data Model

### Activity Object

Each activity is a structured object with required and optional fields:

```typescript
interface Activity {
  id: number;
  name: string;                           // "Hackathon 2024"
  category: string;                       // Must match categorySet label
  topic: string;                          // Must match topicSet name (e.g. "STEM")
  subtopic: string | null;                // Must match topic's subtopic, or null
  location: string;                       // "Hà Nội"
  deadline: string;                       // ISO format "YYYY-MM-DD"
  positions: string[];                    // Job roles open (e.g. ["Developer", "Designer"])
  desc: string;                           // Vietnamese description (shown in modal)
  image: string;                          // REQUIRED photo URL — shown on the card and as the modal header
  link: string;                           // Registration URL (opens in new tab)
}
```

**`image` is required.** Both the card's image area and the detail modal's header render the photo, so there is no fallback artwork — a missing or dead URL leaves a faintly tinted empty box. Any future submission path must validate it.

**Removed fields:** `acronym` (2–3 char shortname shown large in the modal) and `accent` (per-activity gradient pair) were dropped — the photo replaced both. Topic accent *colors* still exist, but they're looked up from the topic in code (see Design System), never stored per activity.

### Data Flow

```
mockActivities (in Activities.ts)
         ↓
Imported by ActivityCards.tsx
         ↓
Passed through filterActivities() function
         ↓ (filters applied: search, category, deadline, topic, position)
↓
Filtered subset returned
         ↓
Rendered as activity cards on screen
```

### Canonical Registries

**src/data/tagData.ts** exports:
- `topicSet` — map of topic names to their subtopics
- `categorySet` — list of valid category labels
- `allTags` — flattened list of all tags (not currently used)

These are the **source of truth** for valid filter values. When adding a new topic, category, or subtopic, update these registries first.

---

## State Management

**All state lives in `src/app/HomeClient.tsx`.** No Redux, Context, or state library.

`HomeClient.tsx` carries the `'use client'` directive. That single directive is the whole client boundary — everything it imports (all nine components) becomes client-side automatically, so no component file needs its own directive.

### Filter State

```typescript
// HomeClient.tsx
const [lang, setLang] = useState<Lang>('VI');                           // 'VI' | 'EN'
const [searchQuery, setSearchQuery] = useState<string>('');             // User's search text
const [categoryFilter, setCategoryFilter] = useState<string>('');       // Single category or empty
const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>(''); // '' | 'week' | 'month'
const [topicFilters, setTopicFilters] = useState<TopicFilter>({        // ONE topic + multi subtopics
  topics: [],
  subtopics: []
});
const [positionFilters, setPositionFilters] = useState<string[]>([]);   // Multi-select positions
```

**Topics are single-select.** `topics` is still an array (so downstream filtering, counts, and types didn't need changing), but it never holds more than one entry. Selecting a topic replaces whatever was there and clears its subtopics; ticking a subtopic under a *different* topic switches to that topic and drops the previous topic's subtopics. **Subtopics remain multi-select** within the selected topic. Enforced by `handleTopicCheck` / `handleSubtopicCheck` in `FilterSections.tsx`.

### Local Component State

Sections like `FilterSections` manage their own UI state (e.g., `expandedTopics` — which topic accordion is open) — this doesn't affect filtering, just UI presentation. Expansion follows selection: choosing a topic expands only that one and collapses any other; deselecting collapses everything.

Other local state: `hovered` (per card), `navOpen` (mobile menu), `drawerOpen` (mobile filters), `currentPage` + `selectedActivity` (ActivityCards), `isMobile` (tracked separately in Navbar / HeroSection / MainContent, each with its own breakpoint).

**One `useCallback`** exists — `handlePageInfoChange` in `MainContent.tsx`. `ActivityCards` reports its page info upward via a `useEffect` that lists the callback as a dependency; without a stable identity the effect re-fired every render and hit "Maximum update depth exceeded". The setter also bails out when page/total are unchanged. Don't inline that prop again.

### State Flow

```
User interaction (click, type)
         ↓
Component calls setState function (passed as prop from HomeClient)
         ↓
HomeClient.tsx updates state
         ↓
HomeClient re-renders all children with new props
         ↓
ActivityCards receives new filter props
         ↓
Filters the mockActivities array
         ↓
Screen updates with filtered results
```

---

## Component Hierarchy

```
app/layout.tsx                  ← SERVER: <html>, <body>, metadata, font links, global CSS
└─ app/page.tsx                 ← SERVER: the "/" route
   └─ app/HomeClient.tsx        ← 'use client' boundary — owns all state
      ├─ Navbar.tsx
      │  └ language toggle
      ├─ HeroSection.tsx
      │  ├─ SearchBar.tsx
      │  └─ Floating topic chips (clickable)
      ├─ MainContent.tsx
      │  ├─ FilterLeft.tsx (desktop sidebar)
      │  │  └─ FilterSections.tsx
      │  │     ├─ Category checkboxes (radio-style)
      │  │     ├─ Deadline options (radio-style)
      │  │     ├─ Topic checkboxes (with expandable subtopics)
      │  │     └─ Position checkboxes
      │  ├─ FilterDrawer.tsx (mobile bottom sheet — toggles visibility based on screen size)
      │  │  └─ FilterSections.tsx (reused)
      │  └─ ActivityCards.tsx (main content)
      │     ├─ Card grid (paginated)
      │     ├─ Detail modal (opens on card click)
      │     └─ Pagination controls
      └─ Footer.tsx

Everything from HomeClient.tsx down runs in the browser. Only layout.tsx and page.tsx run on the server.
```

---

## Filtering Logic

Happens in `src/data/Activities.ts` → `filterActivities()` function.

```typescript
function filterActivities(activities: Activity[], filters): Activity[] {
  return activities.filter(a => {
    // Search: must match name, topic, subtopic, or location
    // Category: single-select, must match exactly
    // Deadline: checks days until deadline
    // Topic: multi-select; if subtopics selected, only show matching subtopics
    // Position: multi-select, at least one position must match
  });
}
```

**Key behavior:** If subtopics are selected under a topic, the filter shows **only activities matching those subtopics**. If a topic is selected but no subtopics, it shows **all activities in that topic**.

---

## Design System

### Colors (CSS custom properties in `src/index.css`)

```
--primary: #1a6fd0        Brand blue (buttons, active states)
--text: #16232c           Primary text
--text-dim: #334652       Secondary text
--text-faint: #546675     Muted/labels
--glass: #ffffff          Card surfaces
--border: rgba(20,52,80,0.13)
--sky: #a8d5f5            Page background
```

### Topic Accent Colors

Used for filter checkboxes, card topic pills, card hover glow, and the image-area tint shown while a photo loads. **The map is duplicated in `FilterSections.tsx` and `ActivityCards.tsx` — update both when changing a color.** (`HeroSection.tsx` separately hardcodes three of these hexes in its `SLOT_DOTS` constant.)

```
STEM                    → #12a6c9 (cyan)
Xã hội                  → #0db87a (green)
Môi trường              → #0dba45 (bright green)
Kinh tế                 → #0d7aba (blue)
Nghệ thuật & Sáng tạo  → #7a5cff (purple)
Ngôn ngữ & Giao tiếp   → #3d5cff (blue)
Sức khỏe                → #c933e6 (magenta)
```

### Fonts

- **Headings (h1, h2):** Montserrat (500–800 weight)
- **Body text:** Be Vietnam Pro (400–600 weight)

---

## Key Interaction Patterns

### Filter Behavior Varies by Source

| Source | Behavior | Reason |
|--------|----------|--------|
| **Hero chip click** (floating topics) | Clears all other filters | Quick, focused search |
| **Filter sidebar checkbox** | Adds/removes only that filter | Granular control, stacking |
| **Search bar** | Adds to existing filters | Combines with other filters |

### Modal Detail Flow

1. User clicks an activity card → `setSelectedActivity(activity)` stores the whole object (`Activity | null` doubles as "is the modal open?")
2. Modal opens with a **210px photo header** (the activity's `image`, `objectFit: cover`) carrying a dark scrim, the category pill, and the close button
3. Below: name, location/deadline/topic meta, description, topic + subtopic tags, open positions
4. CTA button opens the registration URL in a new tab
5. Close button, click outside, or **Esc** → closes modal. While open, `document.body` scroll is locked and restored on cleanup.

---

## Build & Deploy

### Local Development

```bash
cd ecs-finder
npm run dev        # Next dev server at localhost:3000
npm run build      # Production build → .next/
npm start          # Serve the production build locally
npm run lint       # ESLint check (now covers .tsx — see Known Issues)
npm run sync       # Sync from Google Sheets (currently broken)
```

### Deploy Pipeline

```
git push to main
         ↓
Vercel webhook triggered
         ↓
`next build` runs (Vercel auto-detects Next.js)
         ↓
Home page prerendered to static HTML + client bundle
         ↓
Output deployed to vercel.app
```

**Vercel setting:** Root Directory must be `ecs-finder`.

**Data updates:** Require a manual `npm run sync` + `git push` to rebuild and deploy. This is a known friction point (see Proposed Architecture for the fix).

---

## Known Issues & Limitations

1. **`sync.js` is broken** — Still points at old `mockActivities.jsx` filename; outputs old activity shape (tags array instead of `category`/`topic`/`subtopic`, and it never knew about the required `image`). Manual activity edits work; synced activities won't. **Not worth fixing** — the Supabase migration deletes this script entirely.

2. **No translations** — Language toggle is visual-only. UI is in Vietnamese; English mode doesn't switch content. Direction decided: UI chrome + the fixed tag vocabulary get a plain dictionary keyed on the existing `lang` state; free-text activity fields (`desc`) get an English sibling generated automatically by the Claude call in the proposed pipeline — no manual translation. Nothing implemented yet.

3. **No image fallback** — `image` is required but nothing handles a dead or blocked URL (Google Drive links are prone to this). A broken link renders an empty tinted box. An `onError` fallback is worth adding.

4. **No persistence** — All state is in-memory. Closing the tab loses filter state.

5. **Mobile layout is JS-driven, not CSS — and now causes a first-paint flash.** `isMobile` comes from `window.innerWidth` + a resize listener in `Navbar` (≤900), `HeroSection` (≤920/≤560) and `MainContent` (≤1080). Under the old Vite build this was measured during the first render, so phones got the right layout immediately. Under SSR there is no `window` on the server, so each component now renders a **desktop default** and corrects itself in a `useEffect` after hydration — meaning a phone briefly paints the desktop layout (filter rail visible) before it switches. On slow connections this is visible.

   The proper fix is moving these breakpoints into **CSS media queries**, which the browser applies before any JS runs. Note this is blocked by the styling approach: inline `style={{}}` objects cannot contain media queries, so the responsive bits must move to CSS classes (or Tailwind, which is already installed and unused) first.

   The old unmount/remount behavior on breakpoint crossing still applies when dragging a desktop window.

6. **Filter controls aren't real form elements** — checkboxes and radios are styled `<div>`s with `onClick`. Not keyboard-reachable, no screen-reader semantics. Fixable via `role`/`aria-checked`/`tabIndex` on `RadioRow` and the checkbox rows.

7. **No offline support** — No service worker. Static content but no offline fallback.

8. **No analytics** — No tracking of what users search for, filter by, etc.

9. **`npm run lint` exits non-zero.** The old ESLint config only matched `**/*.{js,jsx}`, so `.tsx` files were never linted. `eslint-config-next` now covers them and surfaces two pre-existing `react-hooks/set-state-in-effect` errors — `ActivityCards.tsx` (resets `currentPage` in an effect, causing a one-render empty-grid flash when filtering from a later page) and `FilterSections.tsx` (stores derived `expandedTopics` in state, with an array dependency that re-fires on identity change). Both are real and worth fixing; both change runtime behavior, so they were left out of the migration. This will block CI until addressed.

10. **TypeScript pinned to 6.0** — `typescript-eslint` throws on TypeScript 7, so `eslint-config-next` cannot load with it installed. Revisit when upstream adds support.

11. **Tailwind 4 is installed but entirely unused** — zero `className` attributes across the codebase; all styling is inline `style={{}}`. Either adopt it or remove it and the PostCSS config.

12. **`sharp` carries libvips CVEs** (transitive dependency of Next for image optimization). **Do not run `npm audit fix --force`** — npm's proposed remedy downgrades Next to 9.3.3. Wait for Next to bump `sharp`.

---

## Future Roadmap (See Proposed Architecture)

Planned but not yet implemented:
- **Supabase backend** for live activity updates (no rebuild needed) — the app fetches approved rows at runtime, which means adding loading/error states the static site never needed
- **In-app submission form** replacing the Google Form, posting to a **Next.js Route Handler** (`src/app/api/submit/route.ts`) as the single write path — the migration to Next.js made Route Handlers preferable to Supabase Edge Functions (same origin so no CORS, no Docker for local dev, one deploy)
- **Automated validation** for submitted activities (format, duplicates, link liveness, spam detection)
- **Claude API content check** for legitimacy scoring — the same call also produces the English translation of `desc`
- **Admin UI** for approving/reverting activities (Supabase dashboard at first, in-app later with auth)

Note: the proposal no longer derives `acronym` or `accent`; it must require and validate `image` instead.

See `PROPOSED_DATA_ARCHITECTURE.md` for full details.

---

## Testing

**No automated test suite configured.** QA is manual:
- Run `npm run dev` and test UI locally
- Check filtering, search, modal, mobile responsiveness
- Verify links open correctly

---

## Performance Notes

- **Build time:** ~2s compile with Turbopack; both routes prerender as static
- **Filtering:** Client-side, instant (no network latency)
- **Page load:** Fast — activity content ships in the prerendered HTML, so first paint doesn't wait on JavaScript
- **Caveat:** the whole app sits behind a single `'use client'` boundary, so the full component tree still ships to the browser. Pushing that boundary lower would reduce the JS bundle, but is only worth doing once there's server-fetched data to justify it.

No optimization needed yet unless activity count exceeds 1000+.