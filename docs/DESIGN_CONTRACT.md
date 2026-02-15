# AIYuMe — Design Contract

Direction A: **Neutral Professional + Warm Accent**

> このドキュメントは、AIYuMe全ページで守るべきデザインルールを定義します。
> UIを追加・修正する際は、このファイルに準拠してください。

---

## 1. Design Tokens (`global.css :root`)

### Colors

| Token           | Value     | Usage                                 |
|-----------------|-----------|---------------------------------------|
| `--bg`          | `#0f172a` | Page background                       |
| `--surface`     | `#1e293b` | Card / elevated surface               |
| `--surface-2`   | `#334155` | Secondary surface (rare)              |
| `--text`        | `#f1f5f9` | Primary text                          |
| `--text-muted`  | `#cbd5e1` | Secondary / body text                 |
| `--text-dim`    | `#a0aec0` | Captions, notes (AA compliant)        |
| `--brand`       | `#6366f1` | Indigo — primary brand, B2B CTA       |
| `--brand-light` | `#818cf8` | Hover tints, focus rings              |
| `--accent`      | `#10b981` | Emerald — B2C CTA (LINE buttons)      |
| `--border`      | `rgba(148,163,184,0.13)` | Default border           |
| `--border-strong` | `rgba(148,163,184,0.25)` | Stronger borders       |

### Typography

| Token          | Value   | Notes                    |
|----------------|---------|--------------------------|
| `--text-xs`    | 0.75rem | Badges, captions         |
| `--text-sm`    | 0.875rem| Body small, nav links    |
| `--text-base`  | 1rem    | Body text (16px)         |
| `--text-lg`    | 1.125rem| Lead / subheadings       |
| `--text-xl`    | 1.25rem | `.h3`                    |
| `--text-2xl`   | 1.5rem  | `.h2`                    |
| `--text-4xl`   | 2.5rem  | `.h1`                    |
| `--font-base`  | `'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif` | Japanese priority |

### Spacing (8pt Grid)

`--sp-1` (4px) → `--sp-2` (8) → `--sp-3` (12) → `--sp-4` (16) → `--sp-5` (20) → `--sp-6` (24) → `--sp-8` (32) → `--sp-10` (40) → `--sp-12` (48) → `--sp-16` (64) → `--sp-20` (80)

### Radii / Shadows

| Token         | Value   |
|---------------|---------|
| `--radius`    | 12px    |
| `--radius-sm` | 8px     |
| `--radius-xs` | 4px     |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.25)` |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.30)` |
| `--shadow-lg` | `0 10px 40px -10px rgba(0,0,0,0.50)` |

---

## 2. Component Rules

### Buttons

| Class        | Use Case          | Min Height | Background  | Text Color |
|--------------|-------------------|------------|-------------|------------|
| `.btn-accent`| B2C CTA (LINE)    | 48px       | `--accent`  | `#0f172a`  |
| `.btn-primary`| B2B CTA / neutral| 48px       | `--brand`   | `#fff`     |
| `.btn-outline`| Secondary action  | 48px       | transparent | `--text`   |
| `.btn-ghost` | Tertiary / link   | 48px       | transparent | `--text-muted` |

- All buttons use `border-radius: var(--radius-sm)` (8px)
- Focus ring: `2px solid var(--brand-light)`, offset `3px`
- Hover lifts `-1px` with increased shadow

### Cards

- Background: `var(--surface)` (solid, no backdrop-filter)
- Border: `1px solid var(--border)`
- Padding: `var(--sp-6)` (24px) default
- Hover: border fades to brand tint
- **No `backdrop-filter`** on cards (performance)

### Badges

| Class        | Context | Style                           |
|--------------|---------|-----------------------------------
| `.badge-b2c` | 個人    | Green-tinted, `--accent` border  |
| `.badge-b2b` | 法人    | Gray-tinted, `--text-dim` border |

---

## 3. B2C vs B2B Differentiation

| Aspect         | B2C (Learning / Studio)        | B2B (Automation)             |
|----------------|---------------------------------|-------------------------------|
| Badge          | `badge-b2c` (Green "個人")      | `badge-b2b` (Gray "法人")    |
| CTA button     | `btn-accent` (Emerald)          | `btn-primary` (Indigo)       |
| Card active    | Brand top-border                | Gray top-border (restrained) |
| Card bg        | `var(--surface)`                | Darker `rgba(15,23,42,0.7)`  |
| Tone           | Warm, inviting                  | Professional, understated    |

---

## 4. Accessibility Checklist

When adding or modifying UI:

- [ ] **Contrast** — body text (`--text-muted`) on `--bg` ≥ 4.5:1, `--text-dim` on `--bg` ≥ 4.5:1
- [ ] **Focus** — all interactive elements have visible `:focus-visible` ring (`--focus-ring`)
- [ ] **Touch targets** — buttons ≥ 48px height, links ≥ 44px tap area
- [ ] **Heading hierarchy** — one `h1` per page, `h2` → `h3` in order
- [ ] **Reduced motion** — `@media (prefers-reduced-motion: reduce)` kills animations
- [ ] **Keyboard** — full page navigable via Tab, Escape closes menus
- [ ] **Labels** — buttons/links have visible text or `aria-label`

---

## 5. Layout Rules

- Container max-width: `1080px`
- Container padding: `24px` (desktop), `16px` (mobile ≤ 768px)
- Section padding: `80px` (`.section`), `48px` (`.section-sm`)
- Grid gap: `32px` default, `24px` tight
- Mobile breakpoint: `768px` (column stack)
- Header breakpoint: `900px` (nav wraps)

---

## 6. Changed Files

| File | Change |
|------|--------|
| `src/styles/global.css` | Full rewrite: tokens, typography, spacing, buttons, cards, a11y |
| `src/components/Header.astro` | Refined layout, consult menu a11y, token alignment |
| `src/components/SectionHeading.astro` | Token alignment, tighter eyebrow |
| `src/pages/index.astro` | Direction A design: persona chips, B2C/B2B cards, final CTA |
| `docs/DESIGN_CONTRACT.md` | This file (new) |

---

## 7. Verification

```bash
npm run build       # must pass with 0 errors
```

**Mobile (360px)**: Hero readable, persona chips stacked (tap-friendly), cards single-column, final CTA stacked with B2C/B2B split

**Desktop (1280px)**: 3-column card layout, persona chips inline, final CTA side-by-side groups, full nav visible
