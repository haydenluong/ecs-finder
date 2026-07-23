# Architecture — Current State

**Status:** Active. This document describes the current production architecture (as of July 2025).

---

## Overview

**ecs-finder** is a **static React + TypeScript + Vite web application** with **no backend server**. It displays a filterable catalog of extracurricular activities (competitions, clubs, projects) for Vietnamese students.

All data is bundled at build time and rendered client-side. Filtering, search, and language switching happen in the browser; no network calls.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | React 19 + TypeScript |
| **Build** | Vite 7 + ESLint |
| **Styling** | Tailwind CSS 4 + CSS custom properties |
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
│   ├── components/
│   │   ├── App.tsx                 ← Root. Owns all filter state.
│   │   ├── Navbar.tsx              ← Top bar: logo, links, language toggle
│   │   ├── HeroSection.tsx         ← Banner: headline, search, floating chips
│   │   ├── SearchBar.tsx           ← Input field + result count badge
│   │   ├── MainContent.tsx         ← Layout: FilterLeft | ActivityCards
│   │   ├── FilterLeft.tsx          ← Filter sidebar wrapper
│   │   ├── FilterSections.tsx      ← Checkbox groups (Category, Deadline, Topics, Positions)
│   │   ├── ActivityCards.tsx       ← Card grid + detail modal + pagination
│   │   └── ContactSection.tsx      ← (stub, not integrated yet)
│   │
│   ├── data/
│   │   ├── Activities.ts           ← mockActivities array + filterActivities() function
│   │   └── tagData.ts              ← topicSet, categorySet, allTags registries
│   │
│   ├── types.ts                    ← TypeScript interfaces (Activity, Tag, etc.)
│   ├── utils/
│   │   └── hexRgba.ts              ← Color utility for semi-transparent accents
│   ├── index.css                   ← Global styles + design tokens (--primary, --text, etc.)
│   └── main.tsx                    ← Entry point. Mounts App to <div id="root">
│
├── index.html                      ← HTML shell
├── CLAUDE.md                       ← Development guide (commands, architecture overview)
├── ARCHITECTURE.md                 ← This file
├── package.json                    ← Dependencies + npm scripts
├── vite.config.ts                  ← Vite build config
├── tsconfig.json                   ← TypeScript config
└── scripts/
    └── sync.js                     ← Google Sheets sync script (currently broken)
```

---

## Data Model

### Activity Object

Each activity is a structured object with required and optional fields:

```typescript
interface Activity {
  id: number;
  name: string;                           // "Hackathon 2024"
  acronym: string;                        // "HCK" (2–3 chars, displayed large in modal)
  category: string;                       // Must match categorySet label
  topic: string;                          // Must match topicSet name (e.g. "STEM")
  subtopic: string | null;                // Must match topic's subtopic, or null
  location: string;                       // "Hà Nội"
  deadline: string;                       // ISO format "YYYY-MM-DD"
  positions: string[];                    // Job roles open (e.g. ["Developer", "Designer"])
  desc: string;                           // Vietnamese description (shown in modal)
  accent: [string, string];               // Two-hex gradient for card background
  image?: string;                         // Optional photo URL (Unsplash or direct link)
  link: string;                           // Registration URL (opens in new tab)
}
```

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

**All state lives in `App.tsx`.** No Redux, Context, or state library.

### Filter State

```typescript
// App.tsx
const [lang, setLang] = useState<Lang>('VI');                           // 'VI' | 'EN'
const [searchQuery, setSearchQuery] = useState<string>('');             // User's search text
const [categoryFilter, setCategoryFilter] = useState<string>('');       // Single category or empty
const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>(''); // '' | 'week' | 'month'
const [topicFilters, setTopicFilters] = useState<TopicFilter>({        // Multi-select topics + subtopics
  topics: [],
  subtopics: []
});
const [positionFilters, setPositionFilters] = useState<string[]>([]);   // Multi-select positions
```

### Local Component State

Sections like `FilterSections` manage their own UI state (e.g., which topic accordion is expanded) — this doesn't affect filtering, just UI presentation.

### State Flow

```
User interaction (click, type)
         ↓
Component calls setState function (passed as prop from App)
         ↓
App.tsx updates state
         ↓
App re-renders all children with new props
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
App.tsx (owns state)
├─ Navbar.tsx
│  └ language toggle
├─ HeroSection.tsx
│  ├─ SearchBar.tsx
│  └─ Floating topic chips (clickable)
└─ MainContent.tsx
   ├─ FilterLeft.tsx (desktop sidebar)
   │  └─ FilterSections.tsx
   │     ├─ Category checkboxes (radio-style)
   │     ├─ Deadline options (radio-style)
   │     ├─ Topic checkboxes (with expandable subtopics)
   │     └─ Position checkboxes
   ├─ FilterDrawer.tsx (mobile bottom sheet — toggles visibility based on screen size)
   │  └─ FilterSections.tsx (reused)
   └─ ActivityCards.tsx (main content)
      ├─ Card grid (paginated)
      ├─ Detail modal (opens on card click)
      └─ Pagination controls
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

Hardcoded in `FilterSections.tsx` and `ActivityCards.tsx`:

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

1. User clicks an activity card
2. Modal opens, showing full activity details (name, description, image, link)
3. Link is a button that opens registration URL in new tab
4. Close button or click outside → closes modal

---

## Build & Deploy

### Local Development

```bash
cd ecs-finder
npm run dev        # Vite dev server at localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview prod build locally
npm run lint       # ESLint check
npm run sync       # Sync from Google Sheets (currently broken)
```

### Deploy Pipeline

```
git push to main
         ↓
Vercel webhook triggered
         ↓
`npm run build` runs
         ↓
Vite bundles React + data + styles
         ↓
Output deployed to vercel.app
```

**Data updates:** Require a manual `npm run sync` + `git push` to rebuild and deploy. This is a known friction point (see Proposed Architecture for the fix).

---

## Known Issues & Limitations

1. **`sync.js` is broken** — Still points at old `mockActivities.jsx` filename; outputs old activity shape (tags array instead of new `category`/`topic`/`subtopic`). Manual activity edits work; synced activities won't.

2. **No translations** — Language toggle is visual-only. UI is in Vietnamese; English mode doesn't switch content. Activities are only in Vietnamese.

3. **No persistence** — All state is in-memory. Closing the tab loses filter state.

4. **No mobile optimization** — Responsive CSS exists, but not fully tested on small screens.

5. **No offline support** — No service worker. Static content but no offline fallback.

6. **No analytics** — No tracking of what users search for, filter by, etc.

---

## Future Roadmap (See Proposed Architecture)

Planned but not yet implemented:
- **Supabase backend** for live activity updates (no rebuild needed)
- **Automated validation** for submitted activities (format, duplicates, link liveness, spam detection)
- **Claude API content check** for legitimacy scoring
- **Real-time translations** (EN versions stored in DB)
- **Admin UI** for approving/reverting activities

See `PROPOSED_DATA_ARCHITECTURE.md` for full details.

---

## Testing

**No automated test suite configured.** QA is manual:
- Run `npm run dev` and test UI locally
- Check filtering, search, modal, mobile responsiveness
- Verify links open correctly

---

## Performance Notes

- **Bundle size:** ~150KB (React + dependencies + code)
- **Build time:** <10s with Vite
- **Filtering:** Client-side, instant (no network latency)
- **Page load:** Fast (static HTML, Vercel CDN)

No optimization needed yet unless activity count exceeds 1000+.