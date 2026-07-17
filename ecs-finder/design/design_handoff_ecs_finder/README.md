# Handoff: ECs Finder — Activity Discovery Platform

## Overview
ECs Finder is a browser-based platform for Vietnamese students to discover extracurricular activities: clubs, competitions, projects, and events. It provides search, faceted filtering (category, deadline, topic/subtopic, recruiting position), a paginated card grid of activities, and a detail modal.

## About the Design Files
The bundled HTML file (`ECs Finder.dc.html`) is a **design reference** — a working prototype built for design review, not production code to copy directly. Treat it as the source of truth for layout, visual style, copy, and interaction behavior. The task is to **recreate this design in the target codebase's existing environment** (React, Vue, native, etc.) using its established component patterns, state management, and libraries. If no frontend framework is established yet, choose the most appropriate one and implement the design there — do not ship the HTML file itself.

Note: the file uses a proprietary internal templating syntax (`{{ }}` holes, `sc-for`/`sc-if` loop/conditional tags, inline `style`/`style-hover` attributes). Ignore that syntax layer; read through it to the intended DOM structure, inline styles, and JS logic (loop = list rendering, if = conditional rendering, style-hover = CSS `:hover`).

## Fidelity
**High-fidelity.** All colors, typography, spacing, and copy in the file are final. Recreate pixel-perfectly using the target codebase's component libraries and styling approach (CSS-in-JS, Tailwind, CSS Modules, etc. — whichever the codebase already uses), rather than inline styles.

## Screens / Views

### 1. Navbar (sticky header)
- Sticky, `top:0`, `z-index:40`, full width, `padding:14px 40px`, background `--sky` (#a8d5f5), bottom border `1px solid rgba(20,52,80,0.13)`.
- Layout: flex row, `gap:28px`, items center.
  - Logo: 44×44px image, `border-radius:11px`, `object-fit:cover`, 1px border.
  - Wordmark "ECs Finder": Montserrat 700, 18px, letter-spacing -0.01em.
  - Nav links (flex, gap 6px): "Trang chủ", "Hoạt động", "Về chúng tôi", "Liên hệ" — 14px/600 weight, padding 8px 13px, border-radius 9px, hover: color accent blue + light blue background tint.
  - Language toggle (VI/EN): segmented control, 2 buttons in a pill container (padding 3px, gap 2px, bg `--glass-2` #eef6fd, border, radius 10px). Active tab: dark pill (bg `--ink` #15191d, text `--ink-text` #f2f7fb, radius 7px, padding 5px 12px). Inactive: transparent, `--text-dim`.
  - Primary CTA button: "+ Đăng hoạt động" — dark pill button (bg `--ink`, text `--ink-text`), 11px/20px padding, radius 999px, font 13px/500, hover: translateY(-1px).

### 2. Hero
- Max-width 1320px, centered, padding `44px 40px 30px`.
- Two-column grid: `minmax(0,1fr) minmax(0,430px)`, gap 44px, align-items center. Collapses to 1 column ≤920px (right visual column hidden entirely on mobile).
- **Left column:**
  - Eyebrow pill: dot + "{{count}} hoạt động đang mở đăng ký" (currently 12), 12.5px/600, accent blue text, white pill bg, bordered, radius 999px.
  - H1: Montserrat 800, 52px, line-height 1.05, letter-spacing -0.015em, max-width 16ch. Text: "Soi sáng hành trình **ngoại khoá** của bạn" (bolded span in accent blue `#1a6fd0`).
  - Subhead paragraph: 16.5px, line-height 1.6, `--text-dim` (#334652), max 48ch: "Khám phá câu lạc bộ, cuộc thi, dự án và sự kiện dành cho học sinh, sinh viên trên khắp Việt Nam ở một nơi."
  - Search bar: white pill container (border-radius 14px, padding 7px 8px 7px 18px, shadow `0 10px 26px rgba(20,44,68,0.09)`, max-width 560px): custom SVG magnifier icon (20×20, accent stroke) + text input (16px, placeholder "Tìm câu lạc bộ, cuộc thi, dự án, sự kiện...") + live result count label ("{{n}} kết quả", 12.5px/600, text-dim).
  - Entry animations: staggered `fadeUp` (translateY 22px→0, opacity 0→1), 0.7–0.8s cubic-bezier(0.16,1,0.3,1), delays 0/60/120/180ms.
- **Right column ("heroVisual"):** hidden below 920px.
  - Soft radial white glow circle (310×310px) behind everything.
  - Custom SVG magnifying glass icon, 248px wide, viewBox 200×200: glass lens with radial gradient fill (`magLens`: white→light-blue→transparent), rim ring with linear gradient (`magRim`: near-white → light blue → mid blue #69aeea), handle with linear gradient (`magHandle`: #66baff → #2f86f0 → #1a58c8), plus subtle highlight arc and specular dot. Drop-shadow `0 26px 34px rgba(26,111,208,0.34)`. Continuously animates: `floatMag` (translateY ±14px + rotate -8deg↔-3deg), 6s ease-in-out loop.
  - 3 floating pill chips positioned absolutely around the glass, each with a colored dot + label: "STEM" (cyan dot #12a6c9, top:30px left:2px), "Sáng tạo" (purple dot #7a5cff, top:70px right:-6px), "Thể thao" (green dot #1fae6b, bottom:40px left:34px). White bg, bordered, radius 999px, shadow `0 12px 26px rgba(20,44,68,0.15)`. Each independently bobs via `floaty` keyframes (translateY ±7px) at slightly different durations/delays (5s, 6.2s+0.5s, 5.6s+0.9s) for organic asynchronous motion. **Clickable**: clicking sets the topic filter to STEM / "Nghệ thuật & Sáng tạo" / "Sức khỏe" respectively and smooth-scrolls to the results grid. Hover: border turns accent blue, shadow deepens.

### 3. Main content (2-column: filter rail + results)
- Max-width 1320px, centered, `padding:8px 40px 80px`, grid `238px minmax(0,1fr)`, gap 34px. Collapses to 1 column ≤1080px (rail becomes a horizontal wrapping flex row of filter groups, no longer sticky).

#### Filter rail (single sticky column, replaces old two-sidebar layout)
Sticky at `top:82px`, max-height `calc(100vh - 100px)`, internal scroll, flex column gap 20px.
- Header row: "Bộ lọc" (Montserrat 700/15px) + "Xoá tất cả" (clear-all) text link, accent blue, underline on hover.
- **Loại hình** (Category) — icon (list/lines icon) + uppercase label (12px/700, letter-spacing 0.07em, text-dim). Radio-style rows: "Tất cả" + 3 categories ("Cuộc thi", "Dự án & CLB", "Sự kiện"), each row shows a count badge on the right. Selected row: light blue bg tint + filled radio dot with accent color.
- **Hạn đăng ký** (Deadline) — icon (clock) + same uppercase label style. Radio rows: "Tất cả" / "Trong tuần này" / "Trong tháng này".
- **Chủ đề** (Topic) — icon (layers/hexagon) + label. Two-level tree: 7 parent topics (STEM, Xã hội, Môi trường, Kinh tế, Nghệ thuật & Sáng tạo, Ngôn ngữ & Giao tiếp, Sức khỏe), each with a distinct accent hue (see Design Tokens → Topic colors) and an optional chevron to expand nested subtopics (indented, smaller checkbox, 12.5px text). Checkbox-style selection (rounded-square, checkmark, colored border/fill per topic's accent when selected). Selecting a subtopic does not require selecting its parent.
- **Vị trí tuyển** (Recruiting position) — icon (person) + label. Checkbox rows: Thành viên, Trưởng ban, Cộng tác viên, Tình nguyện viên, Thí sinh.
- All filter interactions are instant (no submit button) and reset pagination to page 0.

#### Results column
- Header row: heading ("Tất cả hoạt động" default, or "Kết quả lọc" when any filter/search active) — Montserrat 700/22px — plus "Trang {{n}}/{{total}}" label on the right.
- **Card grid**: `repeat(auto-fill, minmax(232px,1fr))`, gap 18px. 6 cards per page.
- **Activity card** (see Components below for full spec).
- **Empty state**: shown when zero results — centered dashed-border card, "Không tìm thấy hoạt động" (Montserrat 700/20px) + "Thử điều chỉnh bộ lọc hoặc từ khoá tìm kiếm." (text-dim/14.5px).
- **Pagination**: centered row — prev arrow (‹) / numbered page buttons / next arrow (›). Active page button: accent-blue filled pill, white text, bold. Disabled arrows: 0.5 opacity, `not-allowed` cursor.

### 4. Activity Card (grid item)
- Card: white bg, 1px border, radius 16px, overflow hidden. Entrance: staggered `fadeUp` per index (60ms stagger). Hover: `translateY(-3px)`, border becomes the card's topic accent color, shadow `0 18px 40px rgba(20,44,68,0.16), 0 0 0 1px <accent>, 0 0 24px <accent-glow>`.
- **Image placeholder slot** (top, 150px tall): diagonal-stripe pattern over a linear gradient using the card's assigned accent pair (`accent[0]`→`accent[1]`, 135°→140°, 6 rotating pairs across cards). Centered translucent icon (image/photo glyph, 40×40, white stroke, 0.5 opacity) marks it as a placeholder for a real photo. Top-left: category chip (uppercase, 10.5px/700, white text on dark translucent pill). Top-right: days-remaining badge ("{{n}} ngày" or "Đã đóng"); turns solid red (#e33f3f) when ≤10 days left, otherwise dark translucent.
- **Body** (padding 16px 17px 17px, flex column gap 11px):
  - Title: Montserrat 700, 16px, line-height 1.3.
  - Meta row: location (pin icon) + deadline date (clock icon, format DD.MM.YYYY), 13px, text-dim, gap 14px.
  - Tag row: topic pill (colored per topic accent) + optional subtopic pill (smaller, lighter variant of same color).
  - Footer row: "Vị trí:" label (11.5px, text-faint) + recruiting positions joined by " · " (12.5px, accent blue, 500 weight), separated from body by a top border.
- Clicking a card opens the Detail Modal.

### 5. Detail Modal
- Full-screen overlay: `rgba(18,40,62,0.5)`, centered content, click-outside-to-close, fadeUp entrance.
- Modal panel: max-width 620px, white bg, radius 22px, shadow `0 30px 80px rgba(20,44,68,0.3)`.
  - Hero band (172px): gradient background using the activity's accent pair (135°), close (×) button top-right (translucent dark circle, 36×36), category label (uppercase, 12px, white/85%) and large acronym mark (Montserrat 800, 64px, white/95% — currently a text placeholder for what would become a real image/logo).
  - Body (padding 26px 28px 30px, flex column gap 20px):
    - Title: Montserrat 800, 27px.
    - 3-column meta row: Địa điểm (location, pin icon) / Hạn đăng ký (deadline, clock icon) / Chủ đề (topic name). Each: 11.5px uppercase faint label + 14–14.5px value.
    - Description paragraph: 15px, line-height 1.72, text-dim.
    - Tags section: "Thẻ" label + topic/subtopic pills.
    - Positions section: "Vị trí tuyển" label + position chips (light blue bg, bordered, radius 8px).
    - CTA button: full-width dark pill "Đăng ký ngay" + arrow icon, `--ink` bg, white text, shadow, hover deepens shadow.

## Interactions & Behavior
- **Search**: live-filters the activity list on every keystroke against name, tags, topic, subtopic, and location (case-insensitive substring match). Resets to page 0.
- **Hero topic chips** (STEM / Sáng tạo / Thể thao): clicking sets that single topic as the active filter, clears subtopics, expands that topic in the rail, resets to page 0, and smooth-scrolls to the results section (70px offset above `#ecMain`).
- **Filter rail**: category and deadline are single-select (radio behavior); topics/subtopics/positions are multi-select (checkbox/toggle behavior, array membership). "Xoá tất cả" resets every filter, search, and pagination.
- **Topic tree expand/collapse**: chevron toggles subtopic visibility per parent; selecting a parent topic auto-expands it.
- **Pagination**: 6 cards/page; prev/next disabled at bounds; direct page-number buttons.
- **Card click**: opens Detail Modal for that activity (`detailId` state).
- **Modal**: click outside panel or × button closes it; click inside panel does not propagate/close.
- **Language toggle (VI/EN)**: UI exists (segmented control state) — note the current build only wires the toggle state, not full translated copy; flag this as a follow-up if EN copy is required.
- **Animations**: entrance fade-ups on hero elements and cards (staggered), continuous floating/rotation loop on hero magnifier and chips (see Assets), hover lifts/glows on cards and chips.

## State Management
Suggested state shape (mirrors the prototype's internal state):
- `search: string`
- `category: string` ("all" | one of 3 categories)
- `deadline: string` ("all" | "week" | "month")
- `topics: string[]` (selected parent topics)
- `subtopics: string[]` (selected subtopics)
- `expanded: string[]` (which parent topics show their subtopic list)
- `positions: string[]` (selected recruiting positions)
- `page: number` (current pagination page, 0-indexed)
- `lang: 'VI' | 'EN'`
- `detailId: number | null` (id of activity shown in modal, or null)

Derived/computed:
- Filtered list = activities matching category, topic/subtopic, position, deadline window, and search query (all filters AND together).
- Days-left = `round((deadlineDate - today) / 1 day)`; drives urgency badge color and "Đã đóng" (closed) label when ≤0.
- Each activity's accent gradient pair is assigned round-robin from a fixed 6-pair palette by list index.
- Each topic's display color is derived from a fixed base hue via HSL, adjustable by two global "tweak" params (see below) that were exposed for design review only — a production build can hardcode the resulting colors instead of keeping the hue-shifting logic, unless dynamic theming is wanted.

No data fetching in the prototype — all 12 activities are hardcoded sample data (see Assets/Data below). Real integration should replace this with an API/CMS source.

## Design Tokens

### Colors
```
--sky:        #a8d5f5   (page background base / navbar bg)
--sky-hi:     #d3ebfb   (background gradient highlight, top of page)
--glass:      #ffffff   (card / panel surfaces — solid white, no blur)
--glass-2:    #eef6fd   (secondary surface, e.g. language toggle track)
--border:          rgba(20,52,80,0.13)
--border-bright:   rgba(20,52,80,0.26)
--primary / --accent:    #1a6fd0  (primary blue — links, icons, active states)
--primary-2:             #0b53b8
--accent-2:              #2f8fff  (secondary blue, e.g. position label text)
--ink:        #15191d   (dark pill buttons / CTA bg)
--ink-text:   #f2f7fb   (text on dark pill buttons)
--text:       #16232c   (primary text)
--text-dim:   #334652   (secondary text)
--text-faint: #546675   (tertiary / muted text, counts, faint labels)
```
Page background: `radial-gradient(1200px 720px at 50% -12%, #d3ebfb, #a8d5f5 62%)`, fixed attachment, plus a very subtle fixed dot-grid overlay (`radial-gradient(circle, rgba(20,50,80,0.05) 1px, transparent 1px)`, 34px tile).

**Topic accent colors** (7 parents, cool spectrum, generated via HSL from base hue 205° azure; current build uses vividness "Đậm" = saturation 84%, lightness 50%, spread "Cân bằng" = 1.0×):
- STEM — hue 188 (cyan)
- Xã hội — hue 166 (teal-green)
- Môi trường — hue 144 (green)
- Kinh tế — hue 206 (blue, near brand azure)
- Nghệ thuật & Sáng tạo — hue 262 (violet)
- Ngôn ngữ & Giao tiếp — hue 230 (indigo)
- Sức khỏe — hue 290 (orchid/magenta)

**Card image-gradient pairs** (assigned round-robin by card index):
```
['#1f6fe0','#37b9ff'], ['#1487c9','#3fd0c8'], ['#3a63e6','#6aa8ff'],
['#1f7ae6','#46c6ff'], ['#2467d8','#57b0ff'], ['#0f74d6','#38c6f0']
```

### Typography
Two typefaces only (both Vietnamese-diacritics-compatible):
- **Montserrat** (500/600/700/800) — all headings, wordmark, card titles, modal title/acronym.
- **Be Vietnam Pro** (400/500/600) — body copy, UI labels, buttons, inputs, nav.

Scale in use: 52px/800 (H1) · 27px/800 (modal title) · 22px/700 (section heading) · 20px/700 (empty-state heading) · 18px/700 (wordmark) · 16.5px/400 (hero subhead) · 16px/700 (card title) · 15px/400 (modal description, 1.72 line-height) · 14–14.5px (body/meta) · 13px (card meta) · 12–12.5px (labels, buttons) · 11.5px (tags, faint labels) · 10.5px (category chip, uppercase).

### Spacing / Radius / Shadow
- Radius scale: 999px (pills/buttons/chips), 22px (modal), 18px (empty state), 16px (cards), 14px (search bar), 10–11px (rail buttons/rows), 7–9px (small chips/tags).
- Card shadow (hover): `0 18px 40px rgba(20,44,68,0.16), 0 0 0 1px <topic-accent>, 0 0 24px <topic-accent @ 30% alpha>`.
- Search bar shadow: `0 10px 26px rgba(20,44,68,0.09)`.
- Modal shadow: `0 30px 80px rgba(20,44,68,0.3)`.
- Standard content max-width: 1320px, centered.

### Breakpoints
- ≤1080px: main grid collapses to 1 column; filter rail becomes a static, horizontally-wrapping row of filter groups (loses sticky/scroll behavior).
- ≤920px: hero collapses to 1 column; right-side visual (magnifier + floating chips) is hidden entirely.
- ≤560px: navbar/header padding tightens, H1 drops to 42px, nav links wrap to a new row.

## Assets
- **Logo**: `logo.jpg`, 44×44px, used only in the navbar (referenced as a static image file — replace with the real product logo asset).
- **Magnifying glass hero graphic**: custom inline SVG (not a raster asset) — gradients and paths are fully specified in the HTML file; a developer can either keep it as inline SVG/React component or re-export it as an icon asset.
- **Activity card images**: currently striped-gradient placeholders with a centered photo-stack icon (inline SVG). **Real photography needs to be sourced and dropped in** before this ships — this is the top priority open item.
- All other icons (search, list, clock, layers, person, location pin, chevron, close ×, arrow) are inline SVGs (Lucide-style, 1.5–2.2px stroke, round caps/joins) — no icon font/library dependency; can be swapped for the codebase's existing icon set if one exists.

## Data (sample content)
12 hardcoded sample activities covering the 3 categories and 7 topics, each with: id, name, category, topic, subtopic, location, deadline (ISO date), tags, recruiting positions, description (Vietnamese copy), and an assigned gradient accent pair. Full list is in the logic class of the HTML file (`this.activities = [...]`) — use as seed/mock data or reference for the real content model's shape:
```
{ id, name, acronym, category, topic, subtopic, location, deadline, tags[], positions[], desc, accent[2] }
```

## Open Items / Known Gaps
1. **Real activity photos** are not yet integrated — cards currently show gradient placeholders. This is the top-priority follow-up.
2. **EN localization**: the VI/EN toggle UI exists but only VI copy is implemented; English strings still need to be authored.
3. Not yet tested on real mobile devices — verify touch targets (44px minimum) and the ≤1080/920/560px breakpoints on device.
4. Two "tweak" parameters (`topicVividness`: Nhẹ/Vừa/Đậm, `topicSpread`: Gọn/Cân bằng/Rộng) were exposed during design review to preview different topic-color intensity/spread options. Production should lock in one setting (current default: Đậm / Cân bằng — see Design Tokens → Topic accent colors) and can hardcode the resulting hex values rather than porting the HSL-generation logic, unless per-tenant/dynamic theming is a real requirement.

## Screenshots
`screenshots/` contains reference captures:
- `01-full-page.png` — hero + top of page (default state)
- `02-modal.png` — activity detail modal open
- `03-filter-rail.png` — filter rail (Loại hình / Hạn đăng ký sections)
- `04-card-grid.png` — activity card grid, header/rail hidden for a clean view

## Files
- `ECs Finder.dc.html` — the full design reference (markup + inline logic) described above. Open in any browser to interact with the live prototype.
- `screenshots/` — reference screenshots (see above).
