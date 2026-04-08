# ECs Finder

A community-driven directory for extracurricular activities, clubs, competitions, and events in Vietnam. Built for students who want to discover and filter opportunities by category, topic, deadline, and open positions.

**Live site:** https://ecs-finder.vercel.app

---

## Features

- **Browse activities** — cards showing name, image, location, deadline, tags, and open positions
- **Filter by category** — Dự án & CLB, Cuộc thi, Sự kiện
- **Filter by topic & subtopic** — STEM, Xã hội, Môi trường, Kinh tế, Nghệ thuật, Ngôn ngữ, Sức khỏe
- **Filter by deadline** — within 3 days, 1 week, 2 weeks, 1 month, or longer
- **Filter by position** — find activities recruiting for specific roles
- **Submit an activity** — via Google Form; submissions are reviewed and published through an automated sync pipeline
- **Mobile responsive** — full filter overlay on mobile

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Icons | Lucide React, React Icons |
| Data pipeline | Node.js, Google Sheets API, Google Drive API |
| Hosting | Vercel (auto-deploy on push) |

---

## Project Structure

```
ecs-finder/
├── public/
├── scripts/
│   └── sync.js              # CLI sync script (Google Sheets → mockActivities.jsx)
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ActivityCards.jsx
│   │   ├── FilterLeft.jsx
│   │   ├── FilterRight.jsx
│   │   ├── HeroSection.jsx
│   │   ├── MainContent.jsx
│   │   ├── MobileFilterOverlay.jsx
│   │   ├── Navbar.jsx
│   │   └── SearchBar.jsx
│   ├── data/
│   │   ├── Activities.jsx   # Activity data (source of truth)
│   │   └── tagData.jsx          # Valid categories, topics, subtopics
│   ├── App.jsx
│   └── main.jsx
├── .env.example
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & run locally

```bash
cd ecs-finder
npm install
npm run dev
```

---

## Activity Submission Pipeline

Activities are submitted via a public Google Form and reviewed before going live.

### How it works

1. **Submit** — anyone fills out the Google Form
2. **Review** — open the linked Google Sheet and set the `Status` column to `approved` for entries you want to publish
3. **Sync** — run the sync script locally:
   ```bash
   npm run sync
   ```
   The script reads all approved rows, maps them to activity objects, appends them to `src/data/mockActivities.jsx`, and auto-pushes to git. Vercel redeploys automatically on push.

### Setup (one-time)

1. Enable **Google Sheets API** and **Google Drive API** in [Google Cloud Console](https://console.cloud.google.com)
2. Create a service account → download JSON key → save as `scripts/credentials.json`
3. Share the Google Sheet with the service account email (Editor role)
4. Copy `.env.example` to `.env` and fill in your `SPREADSHEET_ID`

```env
SPREADSHEET_ID=your_spreadsheet_id_here
SHEET_NAME=Form Responses 1
```

> `scripts/credentials.json` and `.env` are gitignored and never committed.

---

## Adding Activities Manually

Edit `src/data/mockActivities.jsx` directly. Each activity follows this shape:

```js
{
  id: 6,
  name: "Activity Name",
  image: "https://...",
  tags: [
    { label: "Dự án & CLB", type: "category" },
    { label: "STEM", type: "topic", subtopic: "Lập trình / AI / Khoa học dữ liệu" }
  ],
  positions: ["Ban Truyền Thông", "Ban Thiết Kế"],
  description: "Single-line description, 300–500 characters recommended.",
  location: "TP. Hồ Chí Minh",
  deadline: "DD/MM/YYYY",
  link: "https://..."
}
```

Valid `label` values for tags must match entries in `src/data/tagData.jsx`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run sync` | Pull approved submissions from Google Sheet and publish |

---

## Contributing

This project is maintained by the ECs Finder team. To submit an activity for listing, use the [submission form](https://forms.gle/xfmn8WT8c93NhtzNA).


The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
