# ECS Finder

A community-driven directory for extracurricular activities, clubs, competitions, and events. Built for students to discover and filter opportunities by category, topic, deadline, and open positions.

**Live site:** https://ecs-finder.vercel.app

---

## Features

- Browse activity cards with name, image, location, deadline, and open positions
- Filter by **category** — Dự án & CLB, Cuộc thi, Sự kiện
- Filter by **topic & subtopic** — STEM, Xã hội, Môi trường, Kinh tế, Nghệ thuật & Sáng tạo, Ngôn ngữ & Giao tiếp, Sức khỏe
- Filter by **deadline** — within a week or month
- Filter by **open position** — find activities recruiting specific roles
- Full-text **search** across activity names and descriptions
- **Submit an activity** via Google Form; approved submissions are synced through an automated pipeline
- Mobile-responsive with a collapsible filter drawer

---

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, TypeScript, Next.js 16 (App Router) |
| Rendering | Static prerender at build time + client hydration |
| Styling | CSS custom properties + inline styles |
| Data pipeline | Node.js, Google Sheets API |
| Hosting | Vercel (auto-deploy on push to `main`) |

---

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

### Prerequisites

- Node.js 18+
- npm

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next dev server |
| `npm run build` | Production build into `.next/` |
| `npm start` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run sync` | Pull approved submissions from Google Sheet and publish |

---

## Project structure

```
ecs-finder/
├── scripts/
│   └── sync.js              # Google Sheets → Activities.ts sync script
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout — <html>/<body>, metadata, fonts
│   │   ├── page.tsx         # "/" route (Server Component)
│   │   └── HomeClient.tsx   # Client boundary — owns all filter and search state
│   ├── types.ts             # Canonical TypeScript interfaces
│   ├── index.css            # Design tokens + global styles
│   ├── components/
│   │   ├── Navbar.tsx       # Sticky nav with VI/EN toggle
│   │   ├── HeroSection.tsx  # Hero with search bar and floating topic chips
│   │   ├── SearchBar.tsx    # Controlled search input with result count
│   │   ├── FilterLeft.tsx   # Sidebar filter rail (category, deadline, topics, positions)
│   │   ├── FilterDrawer.tsx # Mobile filter drawer
│   │   ├── FilterSections.tsx
│   │   ├── MainContent.tsx  # Layout: filter rail + card grid
│   │   ├── ActivityCards.tsx # Card grid, detail modal, pagination, client-side filtering
│   │   └── Footer.tsx
│   └── data/
│       ├── Activities.ts    # mockActivities — the only data array rendered by the UI
│       └── tagData.ts       # topicSet, categorySet, allTags (canonical tag registry)
├── .env                     # gitignored — see setup below
└── package.json
```

---

## Activity data model

Each entry in `src/data/Activities.ts` follows this shape:

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
  image: string,             // REQUIRED photo URL — card image area + modal header
  link: string,              // registration URL — opens in new tab from the modal CTA
}
```

To add a new topic, subtopic, or category, update `src/data/tagData.ts` first, then add entries to `Activities.ts`.

---

## Activity submission pipeline

Activities are submitted via a public Google Form and reviewed before going live.

### How it works

1. **Submit** — anyone fills out the Google Form
2. **Review** — open the linked Google Sheet and set the `Status` column to `approved`
3. **Sync** — run the sync script locally:
   ```bash
   npm run sync
   ```
   The script reads approved rows, appends them to `src/data/Activities.ts`, and auto-commits and pushes. Vercel redeploys on push.

### One-time setup

1. Enable **Google Sheets API** in [Google Cloud Console](https://console.cloud.google.com)
2. Create a service account → download JSON key → save as `scripts/credentials.json`
3. Share the Google Sheet with the service account email (Editor role)
4. Copy `.env.example` to `.env` and fill in your values:

```env
SPREADSHEET_ID=your_spreadsheet_id_here
SHEET_NAME=Form Responses 1
```

> `scripts/credentials.json` and `.env` are gitignored and never committed.

> **Known issue:** `sync.js` still outputs the old tag-array activity shape and targets the old filename. Add activities manually in the new shape above until this is fixed.

---

## Design tokens

Defined as CSS custom properties in `src/index.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--sky` | `#a8d5f5` | Page background |
| `--primary` | `#1a6fd0` | Brand blue — buttons, links, active states |
| `--text` | `#16232c` | Primary text |
| `--text-dim` | `#334652` | Secondary text |
| `--text-faint` | `#546675` | Muted / label text |
| `--glass` | `#ffffff` | Card and panel surfaces |
| `--border` | `rgba(20,52,80,0.13)` | Borders and dividers |

Fonts: **Montserrat** (headings, 500–800) and **Be Vietnam Pro** (body, 400–600), loaded from Google Fonts.

---

## Contributing

To submit an activity for listing, use the public submission form linked on the site. For code contributions, open a pull request against `main`.
