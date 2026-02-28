# Plan: Ambient Backgrounds, Section Sizing & Mobile Nav Fixes (Pass 3)

**Created:** 2026-02-28
**Status:** Draft
**Request:** Seamless header-to-body background transition with rich ambient effects inspired by visual effects library; wider sections on large screens; mobile nav fixes (hamburger position + Services alignment).

---

## Overview

### What This Plan Accomplishes

Eliminates the hard visual transition between header and body by creating a unified ambient background system inspired by the Gradient Mesh and Silk Waves effects from the user's visual effects library. Sections become wider on large screens to fill empty space. Mobile nav gets two fixes: hamburger moves to the left, and Services text centers properly.

### Why This Matters

The site currently feels "flat and sparse" — the rich header gradient abruptly stops at the body's plain `#212529`, sections are capped at `1140px` leaving wide gutters on modern screens, and mobile nav has alignment quirks. These changes transform the site from "clean but empty" to "polished and atmospheric" while maintaining performance.

---

## Current State

### Relevant Existing Structure

| File | Current State |
|------|---------------|
| `styles.css` lines 91-98 | `body.dark-theme` has micro-dot pattern + two subtle radial accents — too faint, no visual connection to header |
| `styles.css` lines 988-1004 | `.header` has rich blue radial gradients on dark gradient base |
| `styles.css` lines 1020-1027 | `.header::after` dot-grid overlay |
| `styles.css` lines 1029-1040 | `.header .overlay` vignette — fades to `#212529` at edges, creating the hard stop |
| `styles.css` line 170 | `.container` max-width: `1140px` at 1200px+ — no wider breakpoint |
| `styles.css` lines 631-650 | Section classes (lighter/darker/team/side-by-side) |
| `styles.css` lines 1299-1303 | `.page-container` — no max-width set, uses `.container` child |
| `styles.css` lines 1413-1447 | Mobile nav: 3-column grid, hamburger in `grid-column: 2` (center) |
| `js/script.js` | No ambient background JS currently |
| User's effects library | `D:\Repos\visual-effects-lib\effects\` — 30+ effects, key ones: gradient-mesh, silk-waves, aurora-wave, holographic |

### Gaps or Problems Being Addressed

1. **Hard header-to-body transition**: Header vignette fades to `#212529`, body is flat `#212529` — jarring cutoff
2. **Sparse body background**: Current micro-dot + faint radials are nearly invisible
3. **Empty side gutters**: Container caps at `1140px`, sections feel narrow on 1440p+ screens
4. **Hamburger position**: Centered in mobile nav (grid-column 2) instead of left
5. **Services text alignment**: The dropdown nav item doesn't center-align its text like other items in mobile menu

---

## Proposed Changes

### Summary of Changes

- **Ambient background system**: CSS-only gradient mesh effect on `body.dark-theme` with large soft blobs that animate slowly, creating a living background that visually connects header to content
- **Header vignette softening**: Modify overlay to fade more gradually, keeping the bottom transparent enough for the body ambient to show through
- **Per-page color palettes**: Use `body` classes (e.g., `page-index`, `page-about`, `page-design`, etc.) to tint the ambient blobs with page-appropriate colors
- **Wider container breakpoints**: Add `1400px` and `1600px` breakpoints for `.container` so sections expand on larger screens
- **Mobile nav fixes**: Move hamburger to grid-column 1, logo to grid-column 3 (right), and fix Services text centering

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `assets/css/ambient.css` | Ambient background system — gradient mesh blobs, keyframes, per-page palettes |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `styles.css` | Remove old body.dark-theme background-image; soften header overlay; add wider container breakpoints; fix mobile nav grid |
| `assets/css/ambient.css` | New file — ambient background layers + per-page color variables |
| All 10 HTML files | Add `<link>` to `ambient.css`; add page-specific body class (e.g., `page-index`, `page-about`) |

### Files to Delete

None.

---

## Design Decisions

### Key Decisions Made

1. **CSS-only ambient (no JS dependency)**: The gradient-mesh effect from the library uses JS to create blobs dynamically, but for a persistent full-page background we can achieve the same look with pure CSS `::before`/`::after` pseudo-elements and fixed `<div>` layers. This avoids adding JS complexity and is more performant for an always-visible background.

2. **Separate `ambient.css` file**: Keeps the ambient system modular and easy to tune without bloating the already-large `styles.css`. Also makes it easy to swap out or disable.

3. **Per-page body classes for color tinting**: Rather than one ambient palette for all pages, each page gets a subtle color shift (e.g., blue for index/services, teal for solutions, warm for about). This adds visual variety without being jarring. The ambient layer reads CSS custom properties set on the body class.

4. **Gradient mesh approach over aurora/silk**: The gradient mesh (large soft overlapping blobs with `blur()` and `mix-blend-mode: screen`) is the best fit for a persistent page background — it's subtle, organic, and doesn't demand attention. Aurora waves and silk flows are more directional/rhythmic and would fight with content. We'll borrow the morph animation from gradient-mesh and the softness from silk-waves.

5. **Container widens to 1320px at 1400px+ and 1440px at 1600px+**: This fills more screen real estate on modern monitors without going full-bleed. The sections already have `max-width: 100%` within the container so they'll naturally expand.

6. **Hamburger to left, logo stays left too**: On mobile, swap the 3-column grid so hamburger is column 1 (left-aligned) and logo is column 2 (centered) — this follows common mobile UX patterns (hamburger top-left, logo center).

### Alternatives Considered

- **Using the effects library directly (loader.js + effect files)**: Rejected — too heavyweight for a background effect. The library is designed for showcasing individual effects on discrete elements, not persistent full-page ambience. We'll adapt the technique instead.
- **Canvas-based ambient**: Rejected — GPU cost for an always-visible canvas is too high; CSS animations are composited on GPU for free.
- **Full-bleed sections (no container)**: Rejected — loses the card-like section design that gives depth.
- **`background-attachment: fixed` mega-gradient on body**: Already partially in place and too static; the animated mesh approach is far richer.

### Open Questions

None — all approaches are defined.

---

## Step-by-Step Tasks

### Step 1: Create `assets/css/ambient.css` — The Ambient Background System

Create a new CSS file that implements the gradient mesh ambient background.

**Architecture:**
- A fixed-position full-viewport layer behind all content
- 4-5 large radial gradient blobs with `filter: blur()` and `mix-blend-mode`
- Slow morph/drift animation (30-40s cycles) — barely perceptible movement
- CSS custom properties for per-page color tinting
- Mobile: reduce to 2-3 blobs, remove `background-attachment: fixed`

**CSS Content:**

```css
/* ========================================
   Ambient Background System
   Inspired by Gradient Mesh + Silk Waves
   ======================================== */

/* Default palette (blue — used on index, services, portfolio, faq, contact) */
:root {
  --ambient-color1: rgba(0, 123, 255, 0.07);
  --ambient-color2: rgba(0, 80, 180, 0.05);
  --ambient-color3: rgba(0, 160, 255, 0.04);
  --ambient-color4: rgba(60, 80, 180, 0.035);
  --ambient-color5: rgba(0, 100, 220, 0.03);
}

/* Per-page palettes */
body.page-about {
  --ambient-color1: rgba(0, 123, 255, 0.06);
  --ambient-color2: rgba(100, 60, 180, 0.05);
  --ambient-color3: rgba(0, 160, 255, 0.04);
  --ambient-color4: rgba(80, 40, 160, 0.035);
  --ambient-color5: rgba(0, 100, 220, 0.025);
}

body.page-design {
  --ambient-color1: rgba(0, 123, 255, 0.07);
  --ambient-color2: rgba(0, 180, 220, 0.05);
  --ambient-color3: rgba(0, 100, 255, 0.04);
  --ambient-color4: rgba(0, 200, 180, 0.03);
  --ambient-color5: rgba(0, 80, 200, 0.03);
}

body.page-solutions {
  --ambient-color1: rgba(0, 160, 200, 0.07);
  --ambient-color2: rgba(0, 123, 255, 0.05);
  --ambient-color3: rgba(0, 200, 180, 0.04);
  --ambient-color4: rgba(0, 100, 220, 0.04);
  --ambient-color5: rgba(0, 180, 160, 0.03);
}

/* The ambient layer — fixed behind everything */
.ambient-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  filter: blur(80px);
}

.ambient-bg .amb-blob {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
}

/* Blob 1 — top-left, largest */
.ambient-bg .amb-blob:nth-child(1) {
  width: 70%;
  height: 70%;
  top: -10%;
  left: -5%;
  background: radial-gradient(circle, var(--ambient-color1) 0%, transparent 70%);
  animation: amb-drift-1 35s ease-in-out infinite;
}

/* Blob 2 — right-center */
.ambient-bg .amb-blob:nth-child(2) {
  width: 60%;
  height: 65%;
  top: 20%;
  right: -10%;
  background: radial-gradient(circle, var(--ambient-color2) 0%, transparent 70%);
  animation: amb-drift-2 40s ease-in-out infinite;
}

/* Blob 3 — center */
.ambient-bg .amb-blob:nth-child(3) {
  width: 55%;
  height: 60%;
  top: 40%;
  left: 25%;
  background: radial-gradient(circle, var(--ambient-color3) 0%, transparent 70%);
  animation: amb-drift-3 30s ease-in-out infinite;
}

/* Blob 4 — bottom-left */
.ambient-bg .amb-blob:nth-child(4) {
  width: 50%;
  height: 55%;
  bottom: -15%;
  left: -10%;
  background: radial-gradient(circle, var(--ambient-color4) 0%, transparent 70%);
  animation: amb-drift-4 38s ease-in-out infinite;
}

/* Blob 5 — bottom-right */
.ambient-bg .amb-blob:nth-child(5) {
  width: 45%;
  height: 50%;
  bottom: 5%;
  right: 5%;
  background: radial-gradient(circle, var(--ambient-color5) 0%, transparent 70%);
  animation: amb-drift-5 33s ease-in-out infinite;
}

/* Drift animations — slow, organic, barely-perceptible */
@keyframes amb-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, 20px) scale(1.05); }
  50% { transform: translate(-20px, 40px) scale(0.95); }
  75% { transform: translate(15px, -15px) scale(1.02); }
}

@keyframes amb-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-25px, 15px) scale(1.08); }
  50% { transform: translate(20px, -30px) scale(0.93); }
  75% { transform: translate(-10px, 20px) scale(1.03); }
}

@keyframes amb-drift-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(35px, -25px) scale(1.06); }
  66% { transform: translate(-25px, 20px) scale(0.97); }
}

@keyframes amb-drift-4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -20px) scale(1.04); }
  50% { transform: translate(-15px, -35px) scale(1.08); }
  75% { transform: translate(25px, 10px) scale(0.96); }
}

@keyframes amb-drift-5 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  30% { transform: translate(-20px, -15px) scale(1.05); }
  60% { transform: translate(30px, 25px) scale(0.94); }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ambient-bg .amb-blob {
    animation: none;
  }
}

/* Mobile — fewer blobs, no fixed positioning for performance */
@media (max-width: 768px) {
  .ambient-bg {
    position: absolute;
    min-height: 100%;
    filter: blur(60px);
  }

  .ambient-bg .amb-blob:nth-child(4),
  .ambient-bg .amb-blob:nth-child(5) {
    display: none;
  }
}
```

**Actions:**
- Create directory `assets/css/` if it doesn't exist
- Create `assets/css/ambient.css` with above content

**Files affected:**
- `assets/css/ambient.css` (new)

---

### Step 2: Modify `styles.css` — Remove Old Body Background, Soften Header Vignette

**2A. Strip body.dark-theme background-image**

The ambient layer replaces the old static background-image. Change `body.dark-theme` to just set the base color:

```css
body.dark-theme {
  background-color: #212529;
}
```

Remove the `background-image`, `background-size`, and `background-attachment` lines (they're now handled by ambient.css).

Also remove the mobile override `body.dark-theme { background-attachment: scroll, scroll, scroll; }` from the 768px media query.

**2B. Soften header vignette for seamless transition**

The `.header .overlay` currently fades to solid `#212529 90%` — this creates the hard edge. Change it to fade more gradually and leave the bottom partially transparent so the ambient layer shows through:

Replace the current `.header .overlay`:
```css
.header .overlay {
  position: absolute;
  left: 0; top: 0; height: 100%; width: 100%;
  background-image: radial-gradient(120% 100% at 48% 42%,
    transparent 20%,
    rgba(33, 37, 41, 0.03) 30%,
    rgba(33, 37, 41, 0.15) 45%,
    rgba(33, 37, 41, 0.45) 60%,
    rgba(33, 37, 41, 0.8) 75%,
    #212529 90%);
  z-index: 1;
}
```

With:
```css
.header .overlay {
  position: absolute;
  left: 0; top: 0; height: 100%; width: 100%;
  background-image: radial-gradient(120% 100% at 48% 42%,
    transparent 20%,
    rgba(33, 37, 41, 0.03) 30%,
    rgba(33, 37, 41, 0.12) 45%,
    rgba(33, 37, 41, 0.35) 60%,
    rgba(33, 37, 41, 0.6) 78%,
    rgba(33, 37, 41, 0.85) 95%);
  z-index: 1;
}
```

Key change: bottom edge goes from solid `#212529` to `rgba(33, 37, 41, 0.85)` — the ambient mesh shows through slightly, creating a seamless blend.

**Files affected:**
- `styles.css`

---

### Step 3: Modify `styles.css` — Wider Container Breakpoints

Add two new breakpoints for larger screens so sections fill more horizontal space:

After the existing `@media (min-width: 1200px) { .container { max-width: 1140px; } }` block, add:

```css
@media (min-width: 1400px) {
  .container { max-width: 1320px; }
}
@media (min-width: 1600px) {
  .container { max-width: 1440px; }
}
```

This gives:
- **1200-1399px**: 1140px (unchanged)
- **1400-1599px**: 1320px (+180px)
- **1600px+**: 1440px (+300px from original)

**Files affected:**
- `styles.css`

---

### Step 4: Modify `styles.css` — Mobile Nav Fixes

**4A. Move hamburger to left side**

In the `@media (max-width: 768px)` block, change the mobile nav grid from `grid-template-columns: 1fr 1fr 1fr` to reposition the hamburger:

Change `.nav-navbar` grid to swap hamburger (left) and logo (center):

```css
.nav-navbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  padding: 0 15px;
  height: 100%;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}
```

Change `.mobile-menu-btn`:
```css
.mobile-menu-btn {
  display: flex !important;
  grid-column: 1;
  justify-self: start;
  align-items: center;
  order: -1;
  margin: 0;
  height: 100%;
}
```

Change `.nav-navbar .nav-item:first-child` (logo):
```css
.nav-navbar .nav-item:first-child {
  flex-grow: 0;
  grid-column: 2;
  justify-self: center;
}
```

This puts: hamburger left | logo center | (empty right).

**4B. Fix Services text centering in mobile menu**

The Services dropdown `nav-item` has `text-align: center` but the `.nav-link` inside it inherits flexbox from the parent. The issue is that the dropdown `nav-item` in the mobile slide-in menu has `justify-content: center` but the Services link with a dropdown arrow may push left. Add an explicit rule:

```css
.nav-navbar.show-mobile-menu .nav-item.dropdown {
  justify-content: center;
}

.nav-navbar.show-mobile-menu .nav-item.dropdown > .nav-link {
  justify-content: center;
  width: 100%;
  text-align: center;
}
```

**Files affected:**
- `styles.css`

---

### Step 5: Add Ambient Layer HTML to All Pages

Add the ambient background `<div>` and stylesheet link to all 10 HTML files (index, about, design, solutions, services, portfolio, contact, faq, blog, work) plus under-construction.html.

**5A. Add stylesheet link** in `<head>` after `styles.css`:
```html
<link rel="stylesheet" href="assets/css/ambient.css">
```

**5B. Add ambient layer** as the first child of `<body>` (right after the opening `<body>` tag):
```html
<div class="ambient-bg" aria-hidden="true">
    <div class="amb-blob"></div>
    <div class="amb-blob"></div>
    <div class="amb-blob"></div>
    <div class="amb-blob"></div>
    <div class="amb-blob"></div>
</div>
```

**5C. Add page-specific class** to each `<body>` tag:

| Page | Body class to add |
|------|-------------------|
| `index.html` | `page-index` |
| `about.html` | `page-about` |
| `design.html` | `page-design` |
| `solutions.html` | `page-solutions` |
| `services.html` | (default palette — no extra class needed) |
| `portfolio.html` | (default palette) |
| `contact.html` | (default palette) |
| `faq.html` | (default palette) |
| `blog.html` | (default palette) |
| `work.html` | (default palette) |

Pages without a specific class use the `:root` default blue palette.

**Files affected:**
- All 11 HTML files

---

### Step 6: Create `assets/css/` Directory

Ensure the directory exists before creating ambient.css.

**Actions:**
- `mkdir -p assets/css`

**Files affected:**
- Filesystem only

---

### Step 7: Validation Pass

After all changes:

1. Open each page in browser — verify ambient blobs are visible, slowly drifting
2. Scroll from header to content — verify no hard color stop, smooth visual transition
3. Check about.html and solutions.html for their tinted palettes
4. Resize browser to 1400px+ and 1600px+ — verify sections are wider
5. Check mobile (or dev tools responsive mode):
   - Hamburger should be on LEFT of navbar
   - Logo should be CENTERED
   - Open menu → Services text should be centered like other items
   - Ambient blobs should still render (position: absolute, only 3 blobs)
6. Test page transitions — ensure no flicker from ambient layer
7. Performance: check no layout thrashing or jank from blur filter on mobile

**Files affected:**
- None (visual inspection)

---

## Connections & Dependencies

### Files That Reference This Area

- `js/script.js` — page transition system uses `sessionStorage` and class manipulation on `body`; adding classes to body won't conflict
- All HTML files — nav structure, body attributes
- `app.yaml` — static file serving; needs `css` extension already covered

### Updates Needed for Consistency

- Memory file (`MEMORY.md`) should be updated to reflect the ambient system, per-page palettes, wider breakpoints, and mobile nav changes

### Impact on Existing Workflows

- No functional changes — all modifications are visual CSS
- Page transitions remain unaffected (ambient layer is fixed position, doesn't participate in page-fade)
- Scroll reveals unaffected (ambient is behind everything at z-index -1)
- No JS changes required for the ambient system

---

## Validation Checklist

- [ ] `assets/css/ambient.css` exists and contains full ambient system
- [ ] All HTML files link to `ambient.css`
- [ ] All HTML files have ambient-bg div as first body child
- [ ] page-about, page-design, page-solutions classes on respective body tags
- [ ] Header vignette fades to semi-transparent (not solid #212529)
- [ ] body.dark-theme no longer has background-image (replaced by ambient layer)
- [ ] Container max-width: 1320px at 1400px+, 1440px at 1600px+
- [ ] Mobile: hamburger on left, logo centered
- [ ] Mobile: Services text centered in slide-in menu
- [ ] No hard color stop between header and body content
- [ ] Ambient blobs visibly drifting on desktop
- [ ] Mobile: only 3 blobs render, position is absolute (not fixed)
- [ ] `prefers-reduced-motion` disables blob animation
- [ ] Page transitions still work correctly
- [ ] No visible performance issues

---

## Success Criteria

The implementation is complete when:

1. Scrolling from header to body content shows a seamless, living gradient mesh background with no hard color boundary
2. Different pages show subtle color palette variations in the ambient background
3. Sections on 1440p+ screens are noticeably wider, filling more horizontal space
4. Mobile hamburger is on the left side of the navbar with logo centered
5. Services text in mobile menu is center-aligned like all other items

---

## Notes

- The ambient opacity values (0.03-0.07) are deliberately very subtle — this is a background, not a feature. If too faint, the values can be bumped by 0.01-0.02 increments.
- The `filter: blur(80px)` on the ambient container is the key to the soft mesh look — it's the same technique the gradient-mesh effect uses. Since the layer is `position: fixed` and `z-index: -1`, the blur is composited once and doesn't repaint on scroll.
- On mobile, switching from `fixed` to `absolute` positioning avoids the well-known iOS `position: fixed` + `filter` performance issue.
- Future enhancement: the ambient layer could accept `data-aurora-colors` or similar attributes to use the effects library directly for more complex animations, but CSS-only is the right choice for v1.
- The per-page palette system is extensible — new pages just need a `body.page-{name}` rule in ambient.css overriding the custom properties.
