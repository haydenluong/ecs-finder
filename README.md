# ECS Finder

A community-driven directory for extracurricular activities, clubs, competitions, and events. Built for students to discover and filter opportunities by category, topic, deadline, and open positions.

**Live site:** https://timkiemhdnk.com

---

## Features

- Browse activity cards with name, image, location, deadline, and open positions
- Filter by **category** — Dự án & CLB, Cuộc thi (hosting or entering), Sự kiện
- Filter by **topic & subtopic** — STEM, Xã hội, Kinh tế, Nghệ thuật & Sáng tạo, Ngôn ngữ & Giao tiếp, Sức khỏe
- Filter by **deadline** — within a week or month
- Filter by **open position** — find activities recruiting specific roles
- **Search** across activity names, topics, subtopics, and locations — in Vietnamese or English, whichever language the interface is in
- **Vietnamese / English interface** — the VI/EN toggle in the navbar translates the site and the submission form, and activity descriptions are translated too
- **Submit an activity** in-app at `/submit`, with automated spam, link, and content checks before a human reviews it at `/admin`
- Mobile-responsive with a collapsible filter drawer

---

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, TypeScript, Next.js 16 (App Router) |
| Rendering | Server Components fetch the data; static prerender + client hydration |
| Styling | Tailwind CSS 4 (theme tokens via `@theme static` in `src/index.css`) |
| Database & storage | Supabase (Postgres + Row Level Security, activity images in Storage) |
| Automated checks | Cloudflare Turnstile, Claude (Haiku 4.5) for content moderation and description translation |
| Hosting | Vercel (auto-deploy on push to `main`) |

---

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

The app needs a `.env` file at the repo root before it will run:

```env
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=         # bypasses RLS - server-side only, never NEXT_PUBLIC_
NEXT_PUBLIC_TURNSTILE_SITE_KEY=    # Cloudflare Turnstile
TURNSTILE_SECRET_KEY=
ANTHROPIC_API_KEY=                 # content check + description translation
SESSION_SECRET=                    # signs the /admin cookie, 32+ chars
ADMIN_USERS=                       # comma-separated label:password pairs
SMTP_HOST=smtp.gmail.com           # submission status emails
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=                         # the sending mailbox
SMTP_PASS=                         # Gmail app password, not the account password
MAIL_FROM=                         # must name the same mailbox as SMTP_USER
```

### Prerequisites

- Node.js 20.9+ (required by Next 16, and by the `--env-file` flag the scripts use)
- npm
- A Supabase project
- An Anthropic API key (for the content check and description translation)
- A Cloudflare Turnstile site/secret key pair (for the submission form)

`.env` is gitignored and never committed. The same variables must also be set in the Vercel project settings; if `SESSION_SECRET` or `ADMIN_USERS` is missing in production, `/admin` fails closed and nobody can log in.

The `SMTP_*` variables fail open, not closed: without them submissions and approvals still work, they just send no email and log `Mail not configured`. `SMTP_PASS` is a Google App Password (Google Account → Security → App passwords, requires 2-Step Verification) — a normal account password will not authenticate over SMTP.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next dev server |
| `npm run build` | Production build into `.next/` |
| `npm start` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run seed` | Upsert the starter activities into Supabase |
| `npm run backfill-translations` | Translate `desc` → `desc_en` for approved rows that predate the column. Safe to re-run |
| `npm run doctor` | React diagnostics via `react-doctor` |
| `npx tsc --noEmit` | Typecheck |

There is no test suite configured.

---

## Project structure

```
ecs-finder/
├── scripts/
│   ├── seed.ts                  # Upsert starter activities (service-role key)
│   └── backfill-translations.ts  # One-off desc → desc_en backfill
├── utils/supabase/
│   ├── server.ts                # Client for Server Components (anon key)
│   ├── client.ts                # Client for browser code (anon key)
│   └── admin.ts                 # Client for Route Handlers (service-role key)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout — <html>/<body>, metadata, fonts, LangProvider
│   │   ├── page.tsx             # "/" route (Server Component) — fetches approved activities
│   │   ├── HomeClient.tsx       # Client boundary — owns all filter and search state
│   │   ├── submit/              # "/submit" — submission form, live preview, image cropper
│   │   ├── admin/               # "/admin" — password-gated approval queue
│   │   └── api/
│   │       ├── submit/          # POST /api/submit — validation, checks, insert
│   │       └── admin/           # login, logout, approve/reject
│   ├── i18n/
│   │   ├── strings.ts           # VI/EN string dictionary + translate()
│   │   └── LangProvider.tsx     # Language context — useLang() → { lang, setLang, t }
│   ├── lib/
│   │   ├── adminAuth.ts         # Signed admin session cookie
│   │   └── translateDesc.ts     # Vietnamese → English description translation
│   ├── types.ts                 # Canonical TypeScript interfaces
│   ├── index.css                # Design tokens + global styles
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky nav with the VI/EN toggle
│   │   ├── HeroSection.tsx      # Hero with search bar and floating topic chips
│   │   ├── SearchBar.tsx        # Controlled search input
│   │   ├── FilterRail.tsx       # Sidebar filter rail (desktop)
│   │   ├── FilterDrawer.tsx     # Mobile filter drawer
│   │   ├── FilterSections.tsx   # The filter controls, shared by rail and drawer
│   │   ├── MainContent.tsx      # Layout: filter rail + card grid
│   │   ├── ActivityCards.tsx    # Card grid, detail modal, pagination, client-side filtering
│   │   ├── ActivityImage.tsx    # Card/modal photo with saved crop position
│   │   └── Footer.tsx
│   └── data/
│       ├── Activities.ts        # filterActivities(), daysLeft(), and the seed array
│       └── tagData.ts           # topicSet, categorySet, POSITIONS, TOPIC_ACCENTS, English labels
├── .env                         # gitignored — see Getting started
└── package.json
```

Activity data is fetched from Supabase in `src/app/page.tsx` and passed down as a prop. `mockActivities` in `Activities.ts` is only the seed source for `npm run seed` — nothing in the UI reads it.

---

## Activity data model

A row in the `activities_submissions` table, and the `Activity` interface in `src/types.ts`:

```ts
{
  id: number,
  name: string,
  category: string,          // must match a categorySet label, e.g. 'Dự án & CLB'
  topic: string,             // must match a topicSet name, e.g. 'STEM'
  subtopic: string | null,   // must match a subtopic under the topic, or null
  location: string,
  deadline: string,          // ISO date: "YYYY-MM-DD"
  positions: string[],       // open roles for recruitment
  desc: string,              // Vietnamese description shown in the modal
  desc_en?: string | null,   // English translation, written on approval; null falls back to desc
  image: string,             // REQUIRED photo URL — card image area + modal header
  image_position?: ImagePosition | null,  // saved crop from the submission form
  link: string,              // registration URL — opens in new tab from the modal CTA
  status?: 'pending' | 'approved' | 'rejected' | 'archived',  // only 'approved' is public
  created_at?: string,       // DB-assigned ISO timestamp
  // Automated check results, shown to a reviewer on /admin
  link_check_passed?: boolean | null,
  content_check_verdict?: 'ok' | 'spam' | 'review' | null,
  content_check_reason?: string | null,
  // Written when a reviewer decides
  reviewed_by?: string | null,
  reviewed_at?: string | null,
}
```

To add a new topic, subtopic, category, or position, update `src/data/tagData.ts` — including its English label in the same file.

> In SQL the `desc` column must be quoted as `"desc"`, since `DESC` is a reserved keyword. The JS client returns it as a plain `desc` key.

---

## Activity submission pipeline

Activities are submitted through the site itself and reviewed before going live.

1. **Submit** — anyone fills in the form at `/submit`, with a live card preview and an image cropper.
2. **Automated checks** — `POST /api/submit` verifies a Cloudflare Turnstile token, rate-limits by IP, rejects duplicate names, validates every field against `tagData.ts`, checks the image's actual byte signature, fetches the registration link to see whether it resolves, and asks Claude to classify the content as ok / spam / inappropriate / review. Clearly inappropriate content is rejected outright; the other verdicts are recorded for the reviewer. The row is inserted with `status: 'pending'` and the image uploaded to Supabase Storage.
3. **Review** — an approver logs in at `/admin`, sees the automated check results alongside the submission, and approves or rejects it. Approving records who decided and translates the description into English.
4. **Live** — the `/` route only ever selects rows with `status = 'approved'`, so approval is all it takes to publish. The page revalidates every 60 seconds.

The link and content checks are deliberately **soft**: a failed check records a warning for the reviewer rather than blocking a submission, because Facebook pages and Google Forms routinely refuse automated requests. Description translation is soft in the same way — if it fails, the activity is still approved and the modal shows the Vietnamese original.

### Database setup

The schema is managed outside this repo, in the Supabase project itself. A new environment needs:

- the `activities_submissions` table, matching the model above (the `desc` column must be created quoted as `"desc"`)
- an `activity-images` Storage bucket, public-read
- `grant usage on schema public` and `grant select on public.activities_submissions` to `anon` and `authenticated`
- RLS enabled, with one `select` policy for `anon`/`authenticated` using `status = 'approved'`
- a `check_rate_limit(p_ip, p_max_requests, p_window_seconds)` function, called by `/api/submit`
- a `reset_activities_submissions_id_seq()` function, called by `npm run seed`

Ask the maintainer for the DDL - it is not committed.

Two independent gates guard every query, and both must pass: table-level `GRANT`, then the Row Level Security policy. With RLS on and no matching policy a `select` returns **zero rows and no error** — an empty grid with nothing in the logs. A seed script succeeding proves nothing about the read path, since it runs as `service_role` and skips both gates.

---

## Translation

The VI/EN toggle in the navbar switches the whole public site and the submission form. `/admin` stays Vietnamese so reviewers always see the values they are approving.

Three separate mechanisms, by the kind of text:

| Text | How it's translated |
|------|--------------------|
| Interface copy | A keyed dictionary in `src/i18n/strings.ts`, read through `useLang().t()` |
| Topics, categories, positions, locations | Lookup maps in `src/data/tagData.ts`, keyed by the Vietnamese value |
| Activity descriptions | Claude, once per activity, at approval time — cached in the `desc_en` column |

Activity **names are not translated** — organisation and competition names stay as submitted. Search matches both languages regardless of the interface language, so a switch never changes which results you see.

Vietnamese is the canonical value everywhere: it is what the database stores, what the filters compare against, and what the topic accent colours are keyed by. English exists only at render time.

---

## Design tokens

Defined in the `@theme static` block in `src/index.css`, so each is available both as a Tailwind utility and as a CSS variable:

| Token | Value | Utility | Usage |
|-------|-------|---------|-------|
| `--color-sky` | `#a8d5f5` | `bg-sky` | Page background |
| `--color-primary` | `#1a6fd0` | `bg-primary` | Brand blue — buttons, links, active states |
| `--color-text` | `#16232c` | `text-text` | Primary text |
| `--color-text-dim` | `#334652` | `text-text-dim` | Secondary text |
| `--color-text-faint` | `#546675` | `text-text-faint` | Muted / label text |
| `--color-glass` | `#ffffff` | `bg-glass` | Card and panel surfaces |
| `--color-border` | `rgba(20,52,80,0.13)` | `border-border` | Borders and dividers |

Each topic also has an accent colour in `TOPIC_ACCENTS` (`src/data/tagData.ts`), applied via `accentVars()` as CSS custom properties.

Fonts: **Montserrat** (headings, 500–800) and **Be Vietnam Pro** (body, 400–600), loaded from Google Fonts.

---

## Contributing

To submit an activity for listing, use the form at [/submit](https://timkiemhdnk.com/submit). For code contributions, open a pull request against `main`.
