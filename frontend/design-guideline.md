# DraftMon — Design Guideline

> **Purpose**: Any developer or AI agent reading this document should be able to build a new page or component that is visually and stylistically consistent with the rest of the DraftMon app. Follow every rule here unless you have an explicit reason to deviate — document it if you do.

---

## 1. Aesthetic: Retro FIFA 97 / 16-bit Football Manager dApp

DraftMon's visual identity blends:
- **Retro arcade / 8-bit game UI** — pixel fonts, chunky borders, hard-offset shadows, step-based animations
- **Monad blockchain green** — a vivid neon `#13ec5b` as the singular brand accent
- **Light cream/off-white backgrounds** with subtle diagonal hatching (no pure white pages)
- **CRT effects** — scanlines overlay, TV flicker on hero, vignette on the whole viewport
- **No rounded corners** — prefer `rounded-none` or `border-radius: 0.125rem` (2px). The app is deliberately square and blocky.

---

## 2. Color Palette

All colors are defined as CSS custom properties in `globals.css → @theme` and imported into Tailwind as named utilities.

### 2.1 Brand Greens (Primary)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--color-primary` | `#13ec5b` | `bg-primary`, `text-primary`, `border-primary` | Main brand green — CTAs, active borders, highlights |
| `--color-primary-dim` | `#0ea640` | `bg-primary-dim` | Hover state for primary green elements |
| `--color-primary-dark` | `#16a249` | `bg-primary-dark` | Badges, active states, gradient stops |
| `--color-primary-deep` | `#15803d` | `bg-primary-deep` | Deep hover, pitch/stadium accents |

### 2.2 Dark Backgrounds

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--color-dark-green` | `#0d1b12` | `bg-dark-green` | Hero sections, nav, ticker, live feed bg |
| `--color-bg-darkest` | `#071009` | `bg-bg-darkest` | Terminal headers, deepest dark accents |
| `--color-bg-dark` | `#102216` | `bg-bg-dark` | Intermediate dark panels |

### 2.3 Light Backgrounds

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--color-bg-light` | `#f6f8f6` | `bg-bg-light` | Page background, card interiors |
| `--color-retro-cream` | `#faf7f2` | `bg-retro-cream` | Warm off-white panels |
| `--color-cream` | `#f8fcf9` | `bg-cream` | Very light green-tinted panels |

### 2.4 Borders & Retro Palette

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--color-border-green` | `#cfe7d7` | `border-border-green` | Light green card borders on dark backgrounds |
| `--color-retro-border` | `#d6d3d1` | `border-retro-border` | Default neutral card borders |
| `--color-retro-gold` | `#ca8a04` | `text-retro-gold` | Gold accents — trophies, S-tier, tournament wins |
| `--color-retro-orange` | `#ea580c` | `text-retro-orange` | Warning, B-tier |

### 2.5 Stat Quality Colors (PixelStatBar / SquadTable)

These are not in the Tailwind theme — use inline styles with `STAT_COLORS` from `src/lib/constants/theme.ts`:

| Key | Hex | When |
|-----|-----|------|
| `excellent` | `#13ec5b` | stat ≥ 85 |
| `good` | `#3b82f6` | stat ≥ 70 |
| `average` | `#f59e0b` | stat ≥ 55 |
| `poor` | `#94a3b8` | stat < 55 |

### 2.6 Rules

- **NEVER hard-code hex values in JSX/TSX as Tailwind arbitrary classes** (e.g., `bg-[#13ec5b]`). Always use the named token (`bg-primary`).
- **For JSX inline `style={{}}` props**, use `var(--color-*)` references (import `BRAND_VAR` from `src/lib/constants/theme.ts`).
- **For SVG props / Canvas / places where CSS vars don't work**, import `BRAND_HEX` from `src/lib/constants/theme.ts`.

```tsx
// ✅ Correct
<div className="bg-primary text-dark-green" />
<div style={{ background: "var(--color-dark-green)" }} />

// ✅ Also correct (SVG)
import { BRAND_HEX } from "@/lib/constants/theme";
<rect fill={BRAND_HEX.primary} />

// ❌ Wrong — hardcoded hex in Tailwind arbitrary class
<div className="bg-[#13ec5b]" />

// ❌ Wrong — hardcoded hex in inline style
<div style={{ background: "#0d1b12" }} />
```

---

## 3. Typography

### 3.1 Font Families

| Variable | Family | Tailwind | Usage |
|----------|--------|----------|-------|
| `--font-display` (`Lexend`) | sans-serif | `font-display` | Default body text, nav links, card text, buttons |
| `--font-pixel` (`Press Start 2P`) | pixel/cursive | `font-pixel` | Headings, labels, badges, stat labels, UI chrome |
| `--font-body` (`VT323`) | monospace | `font-body` | Code, addresses, terminal output, secondary labels |

### 3.2 Usage Rules

- **Page headings (`h1`)** — always `font-pixel` in the `PageHeader` component. Use `text-2xl md:text-3xl`, `uppercase`.
- **Section headings (`h2`, `h3`)** — `font-pixel text-xs uppercase` for pixel-style labels. `font-display font-bold text-lg` or larger for display-style section titles.
- **Body text / paragraphs** — `font-display` (default). `font-body` for VT323 retro feel on secondary text.
- **Micro-labels, badges, counts** — `font-pixel text-[8px]` or `text-[9px]` with `uppercase tracking-widest`.
- **Card names/titles** — `font-pixel text-xs uppercase truncate`.
- **Code / addresses** — `font-body` (`VT323`), or `font-code` (`font-mono` fallback). Use `shortenAddress()` from `src/lib/utils/format.ts` to display wallet addresses.

### 3.3 Text Sizes for Pixel Font

Because `Press Start 2P` is extremely wide, sizes must be kept small:

| Context | Size |
|---------|------|
| Page h1 | `text-2xl md:text-3xl` |
| Section label / card title | `text-xs` (12px) |
| Badge / count | `text-[8px]` – `text-[10px]` |
| Micro-label (e.g., stat label) | `text-[8px]` – `text-[9px]` |
| Tier badge score | `text-[6px]` |

---

## 4. Backgrounds & Texture

### 4.1 Page Background (`html`)

The `html` element has a subtle paper texture:
```css
background-color: var(--color-bg-light); /* #f6f8f6 */
background-image:
  url("...fractalNoise SVG..."),  /* subtle grain */
  repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.07) 10px, rgba(0,0,0,0.07) 12px); /* diagonal hatching */
```
Do not override the `html` background — it applies everywhere automatically.

### 4.2 Dark Hero / Section Background

Use `bg-dark-green` (`#0d1b12`) for full-width dark sections (hero, nav, feed panels).

```tsx
<section className="bg-dark-green text-white">...</section>
```

### 4.3 PageHeader Background

The `PageHeader` component applies the diagonal hatch pattern automatically via inline style. Always use `<PageHeader>` for page-level headings — do not create one-off h1 styles.

### 4.4 Utility Background Classes

```css
.stadium-bg    /* green grass striped gradient */
.pitch-lines   /* white grid lines overlay (opacity 0.2) */
.dot-grid-bg   /* cream + retro dot grid */
```

---

## 5. Cards

### 5.1 Standard Light Card

```tsx
<div className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:border-primary overflow-hidden">
  {/* 5px color accent bar at top */}
  <div className="h-[5px] w-full bg-primary" />
  <div className="p-4">
    {/* content */}
  </div>
</div>
```

Key rules:
- **No border-radius** — blocky pixel feel.
- **Hard-offset shadow** — `4px_4px_0px` (not blur). On hover: `6px_6px_0px`.
- **Top color bar** — `h-[5px]` with brand color.
- **Hover lift** — `-translate-y-1` + shadow growth + `border-primary`.

### 5.2 Retro Card (CSS class)

Use the `.retro-card` CSS class for components that need corner bracket decorations (4 pixel-corner indicators that turn green on hover):

```tsx
<div className="retro-card p-4">...</div>
```

### 5.3 Dark Card (on dark backgrounds)

```tsx
<div className="border border-border-green bg-dark-green/60 p-4">...</div>
```

### 5.4 Tier-specific Cards

For player/manager tier highlighting use these CSS classes:
```css
.legend-card   /* gold border + glow — S tier */
.elite-card    /* purple border + glow — elite */
.great-card    /* blue border + glow — great */
.good-card     /* green border — good */
```

### 5.5 Shadow Utilities

| Class | Shadow | Use |
|-------|--------|-----|
| `.pixel-card-shadow` | `4px 4px 0 rgba(0,0,0,0.1)` | Standard card |
| `.pixel-card-shadow-dark` | `4px 4px 0 rgba(0,0,0,0.2)` | Emphasis |
| `.retro-shadow` | `4px 4px 0 retro-border` | Neutral themed |
| `.retro-shadow-sm` | `2px 2px 0 retro-border` | Small elements |
| `.retro-shadow-lg` | `6px 6px 0 d6d3d1` | Large cards |
| `.green-glow` | `0 0 15px rgba(primary,0.3)` | Active/focus glow |
| `.green-glow-sm` | `0 0 8px rgba(primary,0.2)` | Subtle glow |

---

## 6. Buttons

### 6.1 Global Press Animation

Every `<button>` (except `[disabled]`) and any `<a>` with class `retro-btn` automatically receives the 2px pixel-press shift on `:active`. **Do not add `active:translate-*` or `active:shadow-*` Tailwind classes manually** — they are overridden by the global rule and create inconsistency.

```css
/* Applied globally in globals.css — do not replicate */
button:not([disabled]):active,
a.retro-btn:active,
.retro-btn:active {
  transform: translate(2px, 2px) !important;
  box-shadow: none !important;
  transition-duration: 0s !important;
}
```

### 6.2 Primary CTA Button

```tsx
<button className="px-6 py-3 bg-primary text-dark-green font-pixel text-xs uppercase border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:bg-primary-dim hover:shadow-[4px_4px_0px_0px_rgba(19,236,91,0.25)] transition-colors cursor-pointer">
  BUY NOW
</button>
```

Pattern: green bg → dark text → black border → hard shadow → on hover: dimmer green + green-tinted shadow.

### 6.3 Pixel Filter Pill (active/inactive toggle)

```tsx
<button
  onClick={() => setActive(s)}
  className={`px-4 py-1 font-pixel text-[10px] uppercase border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transition-colors cursor-pointer flex items-center gap-1 ${
    isActive
      ? "bg-primary text-dark-green border-primary"
      : "bg-white text-slate-900 hover:bg-slate-50"
  }`}
>
  {isActive && <span className="text-[8px]">▶</span>}
  {label}
</button>
```

Show a `▶` prefix only on the active state.

### 6.4 Ghost / Outline Button

```tsx
// Outline (for secondary actions on light bg)
<button className="px-4 py-2 font-display font-semibold text-sm border-2 border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer">
  View Details
</button>

// Ghost (muted, tertiary)
<button className="px-4 py-2 font-display text-sm border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
  Cancel
</button>
```

### 6.5 Disabled State

```tsx
<button disabled className="... opacity-50 cursor-not-allowed">...</button>
```

Disabled buttons do **not** get the press animation (the global CSS rule excludes `[disabled]`).

### 6.6 Icon Buttons (Material Symbols)

```tsx
<button className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer">
  <span className="material-symbols-outlined text-xl">settings</span>
</button>
```

---

## 7. Dropdowns / Selects

**Always use `<PixelSelect>`** from `src/components/ui/PixelSelect.tsx`. Never use a native `<select>` — it cannot be styled to match the pixel aesthetic.

```tsx
import { PixelSelect } from "@/components/ui/PixelSelect";

const OPTIONS = [
  { value: "score",  label: "Total Score" },
  { value: "attack", label: "Attack" },
];

<PixelSelect
  value={selected}
  onChange={(v) => setSelected(v)}
  options={OPTIONS}
  className="min-w-[160px]"
/>
```

`PixelSelect` features:
- `border-2 border-slate-900` + `shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]`
- Turns green border + green shadow when open
- `▼` pixel chevron (rotates 180° when open)
- Dropdown list flush below trigger (`mt-[-2px]`)
- Active item: `bg-primary/10 text-primary` + `▶` indicator
- Hover item: `bg-primary text-dark-green`
- Auto-closes on outside click or Escape key
- Full ARIA attributes

---

## 8. Dividers

Three divider patterns — choose based on context:

### 8.1 Pixel Section Divider (between major page sections)

```tsx
<div className="pixel-divider" />
```

Renders a 14px-tall horizontal repeating block pattern using `rgba(0,0,0,0.1)`.

### 8.2 Dashed Card Divider (inside cards)

```tsx
<hr style={{ height: "2px", backgroundImage: "linear-gradient(90deg, #cbd5e1 50%, transparent 50%)", backgroundSize: "8px 100%", border: "none" }} />
```

Creates a dashed line effect via CSS background.

### 8.3 Solid Divider (minimal)

```tsx
<div className="divider" />
/* or */
<hr className="border-t border-slate-200 my-6" />
```

---

## 9. Badges & Labels

### 9.1 Inline Badge (CSS class)

```tsx
<span className="badge badge-primary">ON-CHAIN</span>
<span className="badge badge-amber">LEGEND</span>
<span className="badge badge-muted">INACTIVE</span>
```

All badges are uppercase, small caps with a 2px border.

### 9.2 Pixel Count Badge (beside heading)

Used in `PageHeader` and section headings:

```tsx
<span className="font-pixel text-[8px] px-2 py-1 border border-primary/40 bg-primary/10 text-primary">
  42 REGISTERED
</span>
```

### 9.3 Live Badge

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/40 bg-primary/10 text-primary font-pixel text-[8px] uppercase tracking-widest">
  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
  LIVE
</div>
```

### 9.4 Tier Badge (S / A / B / C)

Tier badges are square (`w-14 h-14`), `border-2 border-slate-900`, `font-pixel`:

| Tier | Background | Text color |
|------|-----------|------------|
| S | `#fbbf24` (gold) | `var(--color-dark-green)` + gold glow |
| A | `#94a3b8` (silver) | `#0f172a` |
| B | `#f97316` (orange) | `#fff` |
| C | `#64748b` (slate) | `#fff` |

---

## 10. Icons

Use **Google Material Symbols Outlined**. They are already loaded globally.

```tsx
<span className="material-symbols-outlined text-primary text-4xl">sports</span>
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">shield</span>
```

Sizing: use Tailwind `text-*` utilities. Common sizes: `text-xl` (20px), `text-2xl` (24px), `text-4xl` (40px).

---

## 11. Page Header

Every interior page **must** use the `<PageHeader>` component:

```tsx
import { PageHeader } from "@/components/layout/PageHeader";

<PageHeader
  title="AI Managers"
  subtitle="Legendary 8-bit tacticians competing on-chain."
  icon="sports"           // optional: Material Symbol name
  badge="SEASON 1"        // optional: badge above title
  badgeLive={true}        // optional: pulsing dot on badge
  count="42 REGISTERED"   // optional: count tag beside title
/>
```

- Title: `font-pixel text-2xl md:text-3xl uppercase`
- Subtitle: `font-body text-xl text-slate-500`
- Bottom-border: `border-b-4 border-primary`
- Background: auto diagonal hatch on `bg-light`

---

## 12. Layout & Spacing

### 12.1 Page Width

```tsx
<div className="mx-auto max-w-7xl px-4 md:px-8">...</div>
```

Use `max-w-7xl` for full content pages. Use `max-w-5xl` for article/detail pages.

### 12.2 Grid Layouts

Cards use responsive grid:
```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

Adjust column counts based on content density. Gap is always multiples of 4 (`gap-4`, `gap-6`, `gap-8`).

### 12.3 Section Spacing

- Between major sections: `py-16` or `py-20`
- Between controls row and grid: `mb-8`
- Inside cards: `p-4` standard, `p-6` for larger cards

---

## 13. Animations & Motion

### 13.1 Page Entry

Every `<main>` element automatically fades + slides up:
```css
animation: pageIn 0.2s ease-out;
/* from { opacity: 0; translateY(6px) } to { opacity: 1; translateY(0) } */
```

### 13.2 Scroll Reveal

Add `data-reveal` attribute to sections for pixel snap-in reveal:
```tsx
<section data-reveal>...</section>
```

The `<ScrollReveal>` component in `layout.tsx` observes all `[data-reveal]` elements and adds class `revealed` when visible. The transition uses `steps(5, end)` for a pixel-snap effect:
```css
[data-reveal] { opacity: 0; transform: translateY(20px); transition: opacity 0.35s linear, transform 0.45s steps(5, end); }
[data-reveal].revealed { opacity: 1; transform: translateY(0); }
```

### 13.3 Hover Transitions

Standard transition for interactive elements:
```tsx
className="transition-colors"       // color-only (fast)
className="transition-all"          // all props (use sparingly)
```
Default duration is `150ms` for color changes, `200ms` for transforms.

### 13.4 Blink / Blinking Text

```tsx
<span className="text-blink">▶ INSERT COIN TO CONTINUE ◀</span>
```

Uses `step-end` blink at 1.1s interval.

### 13.5 Blinking Cursor Suffix

```tsx
<span className="blink-cursor">READY</span>
/* renders: READY_ where _ blinks */
```

### 13.6 Glitch Text

```tsx
<span className="glitch-text font-pixel">MONÁDRAFT</span>
```

Applies RGB-shift glitch every ~5s for hero/accent text.

### 13.7 Pixel Glow (stat values, special numbers)

```tsx
<span className="font-pixel text-primary pixel-glow">???</span>
```

Adds green text-shadow glow.

### 13.8 Ticker

```tsx
<div className="overflow-hidden">
  <div className="ticker-track">
    {/* duplicated content — the CSS animation assumes 50% duplication */}
    {items}{items}
  </div>
</div>
```

### 13.9 What NOT to animate

- Avoid CSS transitions on layout properties (width, height) for performance.
- Do not add bounce or spring animations — keep all motion sharp and mechanical.
- Never use `transition-all` on cards with many properties — use specific properties.

---

## 14. Special Visual Effects

### 14.1 CRT Vignette

Applied globally to `html::before` — a dark radial gradient at edges. No action needed.

### 14.2 Hero Scanlines

```tsx
<div className="relative hero-scanlines">...</div>
```

Adds repeating horizontal scanline overlay via `::after` pseudo-element.

### 14.3 TV Flicker + Scan Band (Hero only)

```tsx
<div className="hero-bg">...</div>           {/* applies TV wave + flicker animation */}
<div className="hero-scan-band" />            {/* moving light band */}
```

Only used on the landing page hero — do not apply to other sections.

### 14.4 Pixel Cursor

The custom pixel crosshair cursor is handled automatically by the global CSS. On hover targets (interactive elements), it switches to a block cursor. No action needed.

---

## 15. Empty States

When a list/grid has no items, show a styled empty state:

```tsx
{items.length === 0 && (
  <div className="col-span-full text-center py-24 border-2 border-dashed border-primary/30">
    <div className="font-pixel text-primary text-5xl mb-6 pixel-glow">???</div>
    <div className="font-pixel text-xs text-slate-700 mb-4">NO AGENTS REGISTERED</div>
    <div className="font-pixel text-[8px] text-slate-400 text-blink">▶ INSERT COIN TO CONTINUE ◀</div>
  </div>
)}
```

Pattern:
- Dashed primary border
- Large `???` in `font-pixel text-primary pixel-glow`
- `font-pixel text-xs` status message
- `font-pixel text-[8px] text-blink` CTA

---

## 16. Loading States

Use the `.skeleton` utility class for shimmer loading placeholders:

```tsx
<div className="skeleton h-6 w-32" />
<div className="skeleton h-4 w-full mt-2" />
```

For real-time status: the `.pulse-dot` class gives a pulsing red dot (used for LIVE indicators).

---

## 17. Client vs Server Components

- **Data-fetching pages** (no `useState`/`useEffect`) → server components (no `"use client"` directive). Keep them thin: fetch data and pass it to child components.
- **Interactive grids** (filters, sort dropdowns, tabs) → split into a separate client component (e.g., `ManagersGrid`, `PlayerBazaar`) that receives data as props.
- **Page shell** → always server component, imports the grid client component.

```tsx
// app/my-page/page.tsx (server)
import { MyGrid } from "@/components/MyGrid";

export default async function MyPage() {
  const data = await fetchData().catch(() => []);
  return (
    <div className="flex-grow">
      <PageHeader title="My Page" icon="star" count={`${data.length} ITEMS`} />
      <MyGrid items={data} />
    </div>
  );
}

// components/MyGrid.tsx (client)
"use client";
import { useState, useMemo } from "react";
export function MyGrid({ items }: { items: Item[] }) { ... }
```

---

## 18. Key Utilities & Helpers

| Utility | Location | Purpose |
|---------|----------|---------|
| `shortenAddress(addr)` | `src/lib/utils/format.ts` | `0x1234...5678` format |
| `formatMon(value)` | `src/lib/utils/format.ts` | `"1.25 MON"` display |
| `retryAsync(fn, retries, delayMs)` | `src/lib/utils/retry.ts` | Exponential-backoff RPC retry |
| `BRAND_HEX` | `src/lib/constants/theme.ts` | Hex values for SVG/Canvas |
| `BRAND_VAR` | `src/lib/constants/theme.ts` | `var(--color-*)` for inline styles |
| `STAT_COLORS` | `src/lib/constants/theme.ts` | Stat quality color map |
| `POS_COLOR`, `POS_GROUP` | `src/lib/constants/squad.ts` | Position styling |
| `PixelSelect` | `src/components/ui/PixelSelect.tsx` | Retro dropdown |
| `PixelStatBar` | `src/components/ui/PixelStatBar.tsx` | Stat progress bar |
| `ManagerAvatar` | `src/components/ui/ManagerAvatar.tsx` | Deterministic avatar from name |
| `PageHeader` | `src/components/layout/PageHeader.tsx` | Standard page heading |
| `ScrollReveal` | `src/components/home/ScrollReveal.tsx` | In-layout scroll observer (already in layout) |

---

## 19. Do's and Don'ts

### Do's
- Use named Tailwind color tokens (`bg-primary`, `text-dark-green`)
- Use `border-2` + hard-offset `shadow-[4px_4px_0px_0px_...]` for pixel shadows
- Use `font-pixel` for all UI labels, headings, badges — keep sizes small (`text-xs` or below)
- Add `data-reveal` to new page sections for scroll animation
- Use `<PixelSelect>` for all dropdowns
- Use `<PageHeader>` for all page headings
- Use `shortenAddress()` for all wallet address displays
- Keep server components as thin data-fetching shells; move interactivity to client components
- Keep `border-radius` at 0 or `0.125rem` — never round corners with `rounded-md` or larger

### Don'ts
- Don't hard-code hex values in Tailwind arbitrary classes (`bg-[#13ec5b]`)
- Don't add `active:translate-*` Tailwind classes — the global CSS handles press animation
- Don't use native `<select>` — use `<PixelSelect>`
- Don't add `cursor-pointer` via Tailwind to buttons — but **do** add it to `<button>` elements since the global CSS hides the cursor on `hover: hover` media
- Don't add CSS transitions with `ease-in-out` on layout — use `ease` or `linear`; keep motion sharp
- Don't use gradient blurs or soft shadows — keep shadows hard-offset (pixel style)
- Don't use `rounded-*` classes beyond `rounded-sm` (2px)
- Don't use white text on primary green (`#13ec5b`) — use `text-dark-green` for contrast
- Don't forget to add `transition-colors cursor-pointer` to interactive elements
- Don't place business logic in page components — keep them pure rendering shells

---

## 20. Quick Reference Cheat Sheet

```
COLORS          FONT FAMILIES           SHADOW CLASSES
──────────────  ──────────────────────  ────────────────────────────
bg-primary      font-pixel (headings)   pixel-card-shadow
text-primary    font-display (body)     pixel-card-shadow-dark
bg-dark-green   font-body (mono/retro)  retro-shadow / retro-shadow-sm
bg-bg-darkest                           retro-shadow-lg
border-primary                          green-glow / green-glow-sm
text-retro-gold

CARD TEMPLATE               BUTTON TEMPLATE
───────────────────────────  ─────────────────────────────────────────
border-2 border-slate-900   bg-primary text-dark-green
shadow-[4px_4px_0px_0px_    font-pixel text-xs uppercase
  rgba(0,0,0,0.1)]          border-2 border-slate-900
hover:-translate-y-1        shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]
hover:border-primary        hover:bg-primary-dim transition-colors
overflow-hidden             cursor-pointer
```
