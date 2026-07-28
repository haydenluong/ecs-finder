# Migrating ECS Finder to Tailwind CSS

> Reviewed once by `plan-reviewer`, which compiled the proposed CSS against the installed compiler and found five critical defects. This revision incorporates all of them; the "Traps" section records the ones that fail *silently* so they don't get reintroduced.

## Context

Tailwind v4 is already installed and wired up (`@tailwindcss/postcss` in `postcss.config.mjs`, `@import "tailwindcss"` at [index.css:3](src/index.css#L3)) but **completely unused** — there is not a single `className` anywhere in `src/`. All 147 styling sites across 9 component files are inline `style={{}}` objects, and everything responsive is done in JavaScript with `window.innerWidth` + resize listeners.

That approach has cost the project real things:

- **Three resize listeners** ([MainContent.tsx:33-38](src/components/MainContent.tsx#L33-L38), [Navbar.tsx:77-86](src/components/Navbar.tsx#L77-L86), [HeroSection.tsx:71-79](src/components/HeroSection.tsx#L71-L79)) that all default to desktop on the server and correct after mount — a visible flash on mobile.
- **A pagination bug**: [MainContent.tsx:138-166](src/components/MainContent.tsx#L138-L166) renders two positionally distinct `<ActivityCards>` elements, so crossing 1080px unmounts one and mounts the other, resetting `currentPage` ([ActivityCards.tsx:334](src/components/ActivityCards.tsx#L334)) and silently closing any open modal ([ActivityCards.tsx:337](src/components/ActivityCards.tsx#L337)).
- **A body-scroll-lock bug**: [MainContent.tsx:168](src/components/MainContent.tsx#L168) renders `FilterDrawer` unconditionally, so widening past 1080px with the drawer open leaves it on screen with `document.body.style.overflow = 'hidden'` still applied.
- **Two incompatible implementations of the same idea** for topic accent colors: `hexRgba()` at [FilterSections.tsx:20-26](src/components/FilterSections.tsx#L20-L26) vs. the `` `${hex}22` `` 8-digit-hex-alpha trick used **11×** in [ActivityCards.tsx](src/components/ActivityCards.tsx). Both break on the `?? 'var(--primary)'` fallback (`rgba(NaN,NaN,NaN,…)` and the invalid `var(--primary)22`). Latent today — all 7 `topicSet` names have entries — but a foot-gun the moment a topic is added.
- **Hover states written as direct DOM mutation** (`e.currentTarget.style.background = …`) in Navbar, Footer and FilterSections, two of them guarded by `if (!isSelected)`.

[ARCHITECTURE.md:331](ARCHITECTURE.md#L331) already identifies this migration as the prerequisite for fixing the responsive flash.

**Decisions taken:** responsive moves to CSS breakpoints, preserving today's switch points exactly; pragmatic hybrid (inline `style` survives only to set CSS variables for per-item runtime values); precomputed alpha variants rather than `color-mix()`; **pure port — zero intended pixel changes**; executed in one pass.

---

## Traps (silent failures — none of these are caught by `tsc`, `eslint`, or `next build`)

1. **`@theme` tree-shakes unused variables.** Tailwind v4 only retains a theme var if a *generated utility* consumes it; it never scans `.tsx`. There are **18 SVG presentation attributes** written as `stroke="var(--primary)"` / `fill="var(--sky)"` — attributes, not CSS, so no utility references them. Pruned var → `stroke: none` → **every filter, search, card and footer icon disappears.** Mitigation: `@theme static`.
2. **`transition-[…]` cannot carry per-property durations.** `transition-[transform_0.3s,box-shadow_0.3s]` compiles to an invalid `transition-property`, the browser drops it, and every transition becomes instant. Mitigation: property names only, timing in separate utilities.
3. **Named text sizes inject a `line-height`.** `text-sm` sets both; `text-[13.5px]` sets only font-size. Every one of the half-pixel sizes in this codebase (`10.5`–`16.5`) must use arbitrary syntax or line spacing shifts.
4. **Preflight makes `border` default to `currentColor`.** Every `border` utility needs an explicit color or it inherits the text color.
5. **Wrapping `FilterRail` in a div kills its sticky positioning.** See Step 4.

---

## Step 0 — Safety net (before touching anything)

1. **Commit or stash the 7 modified files.** `HomeClient.tsx`, `ActivityCards.tsx`, `FilterSections.tsx`, `HeroSection.tsx`, `tagData.ts`, `index.css`, `types.ts` all have uncommitted work. The UTF-8 recovery procedure in Verification (`git checkout -- <file>`) would destroy it. Then branch: `git checkout -b tailwind-migration`.
2. **Align the Tailwind versions.** `package.json` pins `tailwindcss@^4.1.18`, but `@tailwindcss/postcss@4.3.3` nests its own copy — **4.3.3 is the compiler that actually runs**, so the root pin is misleading dead weight. Bump it to match. Also drop `autoprefixer@^10.4.23`: it's a devDependency, absent from `postcss.config.mjs`, and v4 uses Lightning CSS internally.
3. **Capture a visual baseline.** Screenshot the page at 500 / 700 / 910 / 1000 / 1400px, plus each of the 7 topic accents selected, plus a card modal and the mobile drawer. With 147 sites, no test suite and a one-pass execution, this is the only way to distinguish a faithful port from a subtly wrong one.

## Step 1 — Build the design system in `src/index.css`

```css
@import "tailwindcss";

@theme static {
  --color-sky: #a8d5f5;          /* bg-sky — distinct from Tailwind's sky-500 */
  --color-glass: #ffffff;
  --color-glass-2: #eef6fd;
  --color-border: rgba(20,52,80,0.13);
  --color-border-bright: rgba(20,52,80,0.26);
  --color-primary: #1a6fd0;
  --color-primary-2: #0b53b8;
  --color-accent-2: #2f8fff;
  --color-text: #16232c;
  --color-text-dim: #334652;
  --color-text-faint: #546675;

  --font-body: 'Be Vietnam Pro', sans-serif;
  --font-heading: 'Montserrat', sans-serif;

  --breakpoint-sm2: 561px;   /* HeroSection, was width <= 560  */
  --breakpoint-nav: 901px;   /* Navbar,      was width <= 900  */
  --breakpoint-hero: 921px;  /* HeroSection, was width <= 920  */
  --breakpoint-rail: 1081px; /* MainContent, was width <= 1080 */

  --animate-fade-up: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  --animate-sheet-up: sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) both;
  --animate-nav-drop: navDrop 0.2s ease both;
  --animate-float-mag: floatMag 6s ease-in-out infinite;
  --animate-blink: blink 1s step-end infinite;
}

/* Temporary shim — lets every file stay correct mid-migration. Delete in Step 5. */
:root {
  --sky: var(--color-sky);  --glass: var(--color-glass);
  --primary: var(--color-primary);  --text: var(--color-text);
  /* …one alias per old token… */
}
```

- **`static` is mandatory**, not stylistic — see Trap 1.
- **Use `max-*` variants, not the breakpoint values directly.** The compiler auto-generates `max-rail:` → `@media (width < 1081px)`, which is an exact translation of `width <= 1080` and reads far better than min-width arithmetic. Three of the four breakpoints are max-width in origin. (An earlier draft claimed +1px min-widths are "pixel-exact" — they aren't: `window.innerWidth` includes this project's 11px scrollbar ([index.css:83](src/index.css#L83)) while CSS media queries don't, and fractional widths under zoom round differently. The switch point moves either way; `max-*` at least keeps the *intent* legible.)
- **`--accent-2` is kept** — it is live at [ActivityCards.tsx:172](src/components/ActivityCards.tsx#L172) (the "Vị trí:" role list) and is not a duplicate of anything. Only `--accent` is dropped, since it genuinely equals `--primary`; its 3 uses ([HeroSection.tsx:291,300,301](src/components/HeroSection.tsx#L291)) become `--color-primary`.
- The **alias shim** is what makes a one-pass migration survivable: without it, the 133 `var(--…)` references across 9 files are all dead from Step 1 until the last file is done. With it, every file is independently correct at every moment.
- Keep the 7 `@keyframes` at top level, outside `@theme` (verified: they're preserved). `tagPop` and `floaty` aren't registered as `--animate-*` — they need runtime-interpolated timing and are consumed via arbitrary values.
- Keep `html`, `body`, `body::before`, `::-webkit-scrollbar` as plain CSS — document chrome, not component styling.
- `#top` ([index.css:42](src/index.css#L42)) is live. `#heroVisual` and `#ecMain` have no CSS rule and no JS reference — delete those two dead ids.

## Step 2 — Topic accents: precomputed alpha variables

Seven hex colors in [tagData.ts:3-11](src/data/tagData.ts#L3-L11), applied at runtime by `activity.topic`. Not enumerable as static classes, so one inline style sets variables and classes consume them. A helper in `tagData.ts` keeps it in one place:

```ts
export function accentVars(topic: string): React.CSSProperties {
  const hex = TOPIC_ACCENTS[topic] ?? '#1a6fd0';   // literal, not var() — see below
  return {
    '--topic-accent':    hex,
    '--topic-accent-7':  `${hex}11`,
    '--topic-accent-13': `${hex}22`,
    '--topic-accent-20': `${hex}33`,
    '--topic-accent-27': `${hex}44`,
    '--topic-accent-40': `${hex}66`,
    '--topic-accent-60': `${hex}99`,
  } as React.CSSProperties;
}
```

```tsx
<div style={accentVars(activity.topic)}
     className="bg-[var(--topic-accent-13)] border border-[var(--topic-accent-27)]
                shadow-[0_0_9px_var(--topic-accent-60)]" />
```

- Named `--topic-accent`, **not** `--accent`, which would shadow a theme token.
- The fallback is the **literal** `#1a6fd0`, not `var(--color-primary)` — that is precisely what breaks both current implementations, since neither `hexRgba()` nor string concatenation can operate on a `var()`.
- This **deletes `hexRgba()`** ([FilterSections.tsx:20-26](src/components/FilterSections.tsx#L20-L26)) and all 11 `` `${topicAccent}NN` `` concatenations in ActivityCards.
- Alpha levels cover every value in use: `11`→7%, `22`→13%, `33`→20%, `44`→27%, plus `hexRgba(a, 0.08 / 0.4 / 0.6 / 0.7 / 0.75)` at [FilterSections.tsx:320,331,332,333](src/components/FilterSections.tsx#L320) and `:262`. Add levels as needed; the list above is the starting set.
- No `color-mix()`, therefore no `@supports` wrapper and no fallback cliff where a 13% tint renders as a solid block on older webviews.

## Step 3 — Close overlays when the viewport crosses their breakpoint

Two body-scroll-lock effects ([Navbar.tsx:88-91](src/components/Navbar.tsx#L88-L91), [FilterDrawer.tsx:28-40](src/components/FilterDrawer.tsx#L28-L40)) strand the page unscrollable if their open-state goes stale. Today `Navbar.tsx:81` handles its own case in one line (`if (!mobile) setNavOpen(false)`) as a side effect of the resize listener being there anyway; `FilterDrawer` has no such guard, which is the pre-existing bug noted above.

Keep it minimal — **no new hook file**. A ~5-line `matchMedia` listener in `Navbar` and `MainContent`, existing purely to force `navOpen` / `drawerOpen` to `false`. It drives no styling. Both states default to `false`, so SSR is unaffected.

This is the one **behavioral** change in an otherwise pure port, and it fixes a live bug rather than introducing anything.

## Step 4 — Migrate the components

One pass, ascending difficulty. Shared mechanics:

- **Delete, don't convert, the 44 redundant `fontFamily` declarations.** `body` already sets Be Vietnam Pro ([index.css:25](src/index.css#L25)); only the Montserrat headings need `font-heading`. That's ~30% of the apparent work removed.
- Off-scale values use arbitrary syntax, underscores for spaces: `min-h-[41.6px]`, `grid-cols-[repeat(auto-fill,minmax(232px,1fr))]`, `text-[13.5px]` (Trap 3).
- **Transitions** (18 sites): property names only, timing separate — `transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`. Every multi-property transition here shares one duration, so this is lossless; if any site turns out not to, it gets a hand-written class rather than a broken `transition-[…]`.
- Every `border` utility gets an explicit color (Trap 4).
- Boolean style pairs → ternary between two **static** class strings. Never concatenate class names — the scanner can't see them.
- Style-only `onMouseEnter`/`onMouseLeave` → `hover:` utilities, handler and its `useState` deleted. Where the old handler was guarded (`if (!isSelected)`), apply the `hover:` class **conditionally** — an unconditional one overrides the selected state.
- `isMobile ? a : b` → base class + `max-rail:` / `max-nav:` / `max-hero:` / `max-sm2:` override.

**Trivial** — [SearchBar.tsx](src/components/SearchBar.tsx) (5 sites), [FilterLeft.tsx](src/components/FilterLeft.tsx) (4). Port `outline: 'none'` ([SearchBar.tsx:34](src/components/SearchBar.tsx#L34)) as-is; it's an a11y gap, but adding a focus ring is a visual change (see Follow-ups).

**Easy** — [FilterDrawer.tsx](src/components/FilterDrawer.tsx) (10 sites, zero dynamic styles — it early-returns rather than toggling). `animate-sheet-up`, plus Step 3.

**Medium** — MainContent, Navbar, Footer.

- **MainContent**: collapse the [two-branch tree](src/components/MainContent.tsx#L138-L166) into a **single** `<ActivityCards>` in one grid — `grid grid-cols-1 gap-[34px] items-start rail:grid-cols-[238px_1fr]`. This is what fixes the pagination reset. **The `hidden rail:flex` classes go on `FilterRail`'s own root, not a wrapper** — [FilterLeft.tsx:27-37](src/components/FilterLeft.tsx#L27-L37) puts `position:sticky` there, and a wrapper would become the grid item, collapsing to content height under `items-start` and giving sticky zero scroll range (Trap 5). `rail:flex` not `rail:block`, or the rail's `gap: 20` dies. `FilterLeft` needs to accept a `className` or hard-code them. The filter button becomes `max-rail:flex`/hidden, its three `activeFilterCount > 0` ternaries collapse to one conditional class string, and the `isMobile` state + resize effect go.
- **Navbar**: same shape at `nav:` — desktop controls `hidden nav:flex`, hamburger `nav:hidden`, rendered together rather than branched. Hover handlers at [Navbar.tsx:65-66](src/components/Navbar.tsx#L65-L66) → `hover:-translate-y-px`. Hamburger→X needs `translate-y-[6.5px] rotate-45` (6.5px is off-scale). `animate-nav-drop` on the panel.
- **Footer**: the `D` object ([Footer.tsx:6-15](src/components/Footer.tsx#L6-L15)) mostly dissolves, **but SVG `stroke`/`fill` are attributes, not CSS** — switch to `stroke="currentColor"` with a text utility on the parent, letting `D` go entirely. The copy button's hover is `!copied`-guarded. Its hover border `rgba(255,255,255,0.16)` is near-invisible white on a light footer — almost certainly a dark-theme leftover; ported as-is and flagged, not silently redesigned.

**Hard** — FilterSections, ActivityCards, HeroSection.

- **FilterSections**: ~18 boolean ternaries plus the Step 2 accent work. `groupStyle` ([FilterSections.tsx:6](src/components/FilterSections.tsx#L6)) → `py-3.5 px-1`. `RadioRow` hover is `!isSelected`-guarded. Note: once MainContent stops branching, **two `FilterSections` are mounted simultaneously** on mobile with the drawer open. `display:none` keeps the rail out of tab order and the a11y tree, and the duplicated `useMemo` counts are trivial at this data size — but `expandedTopics` ([FilterSections.tsx:134](src/components/FilterSections.tsx#L134)) is component-local, so the copies drift: expand a topic in the drawer, resize past 1081px, and the rail shows it collapsed. Lifting `expandedTopics` to `HomeClient` alongside the other filter state is the clean fix; it's a small state refactor, not a styling one, so it can be deferred.
- **ActivityCards**: largest file, 46 sites. `cardStyle` / `imageAreaStyle` ([ActivityCards.tsx:68-90](src/components/ActivityCards.tsx#L68-L90)) depend on `hovered` + `topicAccent`; both dissolve into classes on the card root, and the whole `hovered` state ([:66](src/components/ActivityCards.tsx#L66), 98-99) is deleted for `hover:` utilities. Per-card stagger stays a variable: `style={{'--d': `${index*60}ms`}}` + `animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_var(--d)_both]` (verified to compile). `line-clamp-2` replaces the `-webkit-box` trio.
- **HeroSection**: hardest. Two breakpoints (`max-hero:`, `max-sm2:`) including a three-way padding ternary at [:101](src/components/HeroSection.tsx#L101). Three things **stay inline by design**: per-chip `top/left/right/bottom` from `CHIP_POSITIONS`, the dual-animation string at [:263-265](src/components/HeroSection.tsx#L263-L265) (`tagPop` + `floaty` with runtime duration *and* delay), and `MAG_TRANSFORMS`. `hoveredRandom` (281-282) is self-contained → `group`/`group-hover:`, state deleted. **`hoverTag` (242-243) stays JS**: hovering a chip transforms a *different* element (the magnifier at [:187-189](src/components/HeroSection.tsx#L187-L189)), and `peer-hover` can't reach backwards in DOM order.

## Step 5 — Delete the alias shim, then update docs

Remove the `:root` alias block once no `var(--old-name)` remains (`grep -rn 'var(--primary)\|var(--sky)\|…' src/` must come back empty except the 18 SVG attributes, which get renamed to `--color-*`).

Three docs assert Tailwind is unused; two are **tracked in git** and were missed by the first draft:

- [ARCHITECTURE.md:25](ARCHITECTURE.md#L25) — "Tailwind 4 installed but **unused** — zero `className`"
- [ARCHITECTURE.md:345](ARCHITECTURE.md#L345) — "Either adopt it or remove it"
- [ARCHITECTURE.md:331](ARCHITECTURE.md#L331) — describes this migration as pending; mark it done
- `CLAUDE.md` (gitignored) — the styling section, design tokens (now `@theme`), and topic accents (now `accentVars`)
- `README.md` — check the tech-stack table

---

## Verification

1. **`npm run build` first, then open the page and look for missing icons.** This is the Trap 1 regression and nothing automated catches it. Also confirms Tailwind's source detection finds `src/**/*.tsx` — if the page renders wholly unstyled, add `@source "../src";` to `index.css`.
2. `npx tsc --noEmit` — clean today, must stay clean. Watch the `as React.CSSProperties` casts on the CSS-variable style objects.
3. `npm run lint` — baseline is exactly **2 errors + 4 warnings**; the errors are [ActivityCards.tsx:342](src/components/ActivityCards.tsx#L342) and [FilterSections.tsx:139](src/components/FilterSections.tsx#L139), neither a resize effect, so removing those won't clear them. Must not exceed the baseline.
4. `npm run doctor` (`react-doctor`) — deleting three resize effects and several hover states should move this in a good direction.
5. **Diff against the Step 0 screenshots.** Pure port: any difference is a bug.
6. Manual sweep in `npm run dev`:
   - **Resize slowly through 1080px** — rail appears/disappears, and pagination + open modal now *survive* the crossing. Repeat at 900 (navbar) and 920/560 (hero).
   - **Open the mobile nav panel, widen past 900px** — page must stay scrollable. Same for the drawer across 1080px. This is the Step 3 fix.
   - **Scroll a long filter list on desktop** — the rail must still stick (Trap 5).
   - **All 7 topic accents** — checkboxes, card pills, card hover glow, hero chip dots. Tints must be tints, not solid blocks.
   - **Transitions are not instant** — card hover lift, filter row background, chip border (Trap 2).
   - **Animations**: card stagger, headline typewriter + caret blink, magnifier float, chip float/pop, drawer slide-up, nav drop.
   - **Hover**: card lift, nav CTA lift, a *selected* filter row not flickering, footer copy button before/after copying.
7. Vietnamese text intact — every string here is UTF-8 Vietnamese. Use the Edit tool, never PowerShell text processing; sanity-check `git diff --stat` for implausible line counts.

## Follow-ups (deliberately out of scope)

Real gaps found during review, excluded to keep the port pixel-neutral:

- No focus indicator on the search input ([SearchBar.tsx:34](src/components/SearchBar.tsx#L34) sets `outline: none`).
- No focus indicator on activity cards, which are `role="button" tabIndex={0}` ([ActivityCards.tsx:94-95](src/components/ActivityCards.tsx#L94-L95)).
- Topic/subtopic/position checkboxes have no hover state while `RadioRow` does.
- `expandedTopics` should probably be lifted to `HomeClient` (see FilterSections above).
- Footer copy-button hover border is white-on-light — likely a dark-theme leftover.
