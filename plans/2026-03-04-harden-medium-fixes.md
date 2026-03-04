# Plan: Fix Medium Findings from Harden Report Pass 2

**Created:** 2026-03-04
**Status:** Implemented
**Request:** Fix all 7 code-level Medium findings (M1–M7) from the second harden report. M8 (Formspree placeholder ID) requires manual user action and is out of scope.

---

## Overview

### What This Plan Accomplishes

Eliminates the remaining Medium-severity findings: replaces all 13 `transition: all` instances with specific property transitions, removes permanent `will-change` from scroll reveals, normalizes z-index stacking, replaces `document.write()` in all 10 footers (unblocking CSP), converts `javascript:void(0)` links to semantic buttons, and replaces the hardcoded scroll timeout with `scrollend` event detection.

### Why This Matters

These fixes complete the hardening cycle. M5 (`document.write` removal) is the gateway to enabling Content-Security-Policy in helmet — the last remaining security header. The performance fixes (M1–M3) eliminate unnecessary compositing and repainting. The accessibility fix (M6) improves screen reader and keyboard navigation.

---

## Current State

### Relevant Existing Structure

- `styles.css` — 13 instances of `transition: all`, 3 `will-change` on scroll reveals, z-index collision at 1001
- `design.html` — 6 `javascript:void(0)` expanding card trigger links
- All 10 HTML files — `document.write(new Date().getFullYear())` in footers
- `js/script.js` — hardcoded 800ms scroll timeout, scroll reveal init
- `server.js` — `contentSecurityPolicy: false` in helmet config

### Gaps or Problems Being Addressed

| Finding | Problem |
|---------|---------|
| M1 | 13 `transition: all` instances cause unnecessary compositing on every state change |
| M2 | `will-change: opacity, transform` on `.reveal*` classes holds GPU memory permanently after one-shot animation |
| M3 | Overlay card hover triggers `transition: all` on 3 nested elements (subset of M1) |
| M4 | Z-index 1001 used by both `.expanding-card.is-expanded` and navbar-related styles |
| M5 | `document.write()` in all 10 footers blocks CSP adoption |
| M6 | 6 `<a href="javascript:void(0)">` links should be `<button>` for accessibility |
| M7 | 800ms hardcoded scroll-to-top timeout can cause visual jump on slow devices |

---

## Proposed Changes

### Summary of Changes

- **M1/M3:** Replace all 13 `transition: all` with specific property lists
- **M2:** Remove `will-change` from `.reveal*` CSS classes
- **M4:** Normalize z-index into distinct layers
- **M5:** Replace `document.write()` in all 10 footers with `<span class="copyright-year"></span>` + JS init
- **M6:** Convert 6 `<a href="javascript:void(0)">` to `<button type="button">` in design.html
- **M7:** Replace hardcoded 800ms timeout with `scrollend` event (with fallback)
- **Bonus:** Re-enable `contentSecurityPolicy` in helmet after M5 is done

### New Files to Create

None.

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `styles.css` | Replace 13 `transition: all`, remove 3 `will-change`, normalize z-index |
| `design.html` | Replace 6 `<a>` triggers with `<button>`, update footer |
| `index.html` | Update footer |
| `about.html` | Update footer |
| `contact.html` | Update footer |
| `services.html` | Update footer |
| `solutions.html` | Update footer |
| `faq.html` | Update footer |
| `portfolio.html` | Update footer |
| `work.html` | Update footer |
| `blog.html` | Update footer |
| `js/script.js` | Add copyright year init, replace scroll timeout with `scrollend` |
| `server.js` | Re-enable CSP in helmet config |

### Files to Delete

None.

---

## Design Decisions

### Key Decisions Made

1. **Specific transitions per element:** Each `transition: all` is replaced based on what actually changes on hover/state. For example, `.btn` hovers change `background-color`, `border-color`, `color`, `transform`, `box-shadow` — so the transition lists those specifically.

2. **Remove `will-change` entirely from reveal classes:** Adding/removing it via JS adds complexity for marginal benefit on a one-shot 0.6s CSS transition. Modern browsers handle this fine without `will-change` for simple opacity/transform transitions.

3. **Z-index normalization to 3-digit values:** Using 100/200/300/400 for navbar/dropdown/overlay/card layers. Leaves room for future insertions. The expanding card JS sets inline `z-index: 1001` — this will be updated to use the new layer value.

4. **`scrollend` with fallback:** `scrollend` event is well-supported (Chrome 114+, Firefox 109+, Safari 17.5+). For older browsers, a 1-second fallback timeout is used instead of the current 800ms, giving more margin.

5. **CSP re-enabled with `unsafe-inline` for remaining inline styles:** The footer `document.write` was the only thing blocking CSP. After removal, we can enable CSP with `script-src 'self'`. Inline styles set by JS (expanding cards, transitions) require `style-src 'unsafe-inline'` or nonce — for now, we'll use a permissive but present CSP that can be tightened later.

### Alternatives Considered

- **JS-managed `will-change` for reveals:** Adding `will-change` in JS before animation and removing after `transitionend`. Rejected — adds code complexity for negligible gain on a 0.6s transition.
- **CSS custom properties for z-index layers:** Rejected as over-engineering for 5 layers.

### Open Questions

None.

---

## Step-by-Step Tasks

### Step 1: Replace all `transition: all` with specific properties (M1/M3)

Replace each of the 13 instances based on what actually changes on that element:

**Replacements:**

| Line | Selector | Replace with |
|------|----------|-------------|
| 36 | `.page-fade-out/in/transitioning .page-navbar` | `transition: opacity 0.5s ease !important;` |
| 348 | `.form-control[type="submit"]` | `transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;` |
| 401 | `.btn` | `transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;` |
| 570 | `.expanding-card-close` | `transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease;` |
| 831 | `.page-navbar` | `transition: height 0.5s ease, background-color 0.5s ease, box-shadow 0.5s ease;` |
| 913 | `.nav-logo` | `transition: height 0.5s ease;` |
| 980 | `.dropdown-item` | `transition: background-color 0.3s ease, color 0.3s ease;` |
| 1085 | `.hamburger-icon` | `transition: background-color 0.3s ease;` |
| 1096 | `.hamburger-icon::before/after` | `transition: transform 0.3s ease, top 0.3s ease, bottom 0.3s ease;` |
| 1324 | `.overlay-img .overlay` | `transition: background-color 0.5s ease;` |
| 1334 | `.overlay-img .des` | `transition: top 0.5s ease;` |
| 1354 | `.overlay-img .des p` | `transition: opacity 0.5s ease, visibility 0.5s ease, margin-top 0.5s ease;` |
| 2218 | `.faq-pill` | `transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;` |

**Files affected:** `styles.css`

---

### Step 2: Remove `will-change` from scroll reveal classes (M2)

Remove `will-change: opacity, transform;` from lines 2409, 2416, 2423.

**Before:**
```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  will-change: opacity, transform;
  transition: opacity 0.6s ease, transform 0.6s ease;
}
```

**After:**
```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
```

Same for `.reveal-left` and `.reveal-right`.

**Files affected:** `styles.css`

---

### Step 3: Normalize z-index layers (M4)

Establish a clear stacking order:

| Layer | Z-Index | Elements |
|-------|---------|----------|
| Ambient BG | 0 | `.ambient-bg` |
| Content overlays | 1-2 | Various pseudo-elements |
| Contact section | 10 | `.contact-section` |
| Navbar | 100 | `.page-navbar`, `.page-navbar.affix` |
| Dropdown menus | 200 | `.dropdown-menu` |
| Card overlay bg | 300 | `.card-overlay-background` |
| Expanded card | 400 | `.expanding-card.is-expanded` |
| Card content | 400 | `.expanding-card-content` |
| Card close btn | 500 | `.expanding-card-close` |
| Modal | 600 | `.modalBox` |
| Mobile nav menu | 100 | (stays same layer as navbar, renders on top via DOM order) |

**CSS changes:**

- `.expanding-card.is-expanded` z-index: `1001` → `400` (line 523)
- `.card-overlay-background` z-index: `999` → `300` (line 547)
- `.expanding-card-close` z-index: `1002` → `500` (line 571)
- `.expanding-card-content` z-index: `1001` → `400` (line 616)
- `.dropdown-menu` z-index: `1000` → `200` (line 952)
- `.page-navbar.affix` — no explicit z-index set; add `z-index: 100;` to the `.page-navbar` base rule (line ~825)
- `.contact-section` z-index: `990` → `10` (line 1118)
- `.modalBox` z-index: `1000` → `600` (line 1383)

**Also update JS:** In `js/script.js`, the expanding card `expand()` method sets `this.card.style.zIndex = '1001'` — change to `'400'`.

**Mobile media query z-indexes** also need updating to match. Check all `@media` blocks.

**Files affected:** `styles.css`, `js/script.js`

---

### Step 4: Replace `document.write()` in all 10 footers (M5)

**In each HTML file**, replace:
```html
<p class="infos">&copy; <script>document.write(new Date().getFullYear())</script>, Made by <a>ICU Media Design</a></p>
```

With:
```html
<p class="infos">&copy; <span class="copyright-year"></span>, Made by <a>ICU Media Design</a></p>
```

**In `js/script.js`**, add to the DOMContentLoaded handler:

```javascript
// Copyright year
document.querySelectorAll('.copyright-year').forEach(function(el) {
    el.textContent = new Date().getFullYear();
});
```

**Files affected:** All 10 HTML files, `js/script.js`

---

### Step 5: Convert `javascript:void(0)` links to buttons (M6)

**In `design.html`**, replace all 6 instances of:
```html
<a href="javascript:void(0)" class="expanding-card-trigger">
```
With:
```html
<button type="button" class="expanding-card-trigger">
```

And replace corresponding closing tags:
```html
</a>
```
With:
```html
</button>
```

**Add CSS button reset** for `.expanding-card-trigger` in `styles.css`:

```css
button.expanding-card-trigger {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: inherit;
  cursor: pointer;
}
```

This goes right after the existing `.expanding-card-trigger` rule at line ~492.

**Files affected:** `design.html`, `styles.css`

---

### Step 6: Replace hardcoded scroll timeout with `scrollend` (M7)

**In `js/script.js`**, replace the `handlePageTransition` function's scroll+timeout block:

**Before:**
```javascript
if (currentScrollY > 0) {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    setTimeout(() => {
        startFadeTransition(targetUrl);
    }, 800);
} else {
    startFadeTransition(targetUrl);
}
```

**After:**
```javascript
if (currentScrollY > 0) {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    if ('onscrollend' in window) {
        window.addEventListener('scrollend', function onScrollEnd() {
            window.removeEventListener('scrollend', onScrollEnd);
            startFadeTransition(targetUrl);
        });
    } else {
        // Fallback for browsers without scrollend support
        setTimeout(() => {
            startFadeTransition(targetUrl);
        }, 1000);
    }
} else {
    startFadeTransition(targetUrl);
}
```

**Files affected:** `js/script.js`

---

### Step 7: Re-enable Content-Security-Policy in helmet (bonus)

**In `server.js`**, replace:
```javascript
app.use(helmet({
    contentSecurityPolicy: false, // Static site uses inline scripts (document.write in footer) — enable after M5 fix
}));
```

With:
```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'", "https://formspree.io"],
        },
    },
}));
```

Note: `'unsafe-inline'` is needed for `styleSrc` because the expanding cards and page transitions set inline styles via JS. `connectSrc` allows Formspree fetch calls.

**Files affected:** `server.js`

---

### Step 8: Update z-index values in mobile media queries

Review all `@media` blocks in `styles.css` that contain z-index values and update them to match the new layer system from Step 3.

Key mobile z-index lines to update:
- Line ~1600: `.page-navbar.affix` in mobile — ensure consistent with desktop
- Line ~1617: mobile nav z-index `1001` → `100`
- Line ~1657: mobile menu overlay `998` → `99`
- Line ~1674: mobile dropdown `999` → `200`
- Line ~1734: closing mobile menu `999` → `200`
- Line ~824: desktop dropdown `.dropdown-menu` z-index handled in step 3
- Line ~1470: any additional dropdown mobile z-index `999` → `200`

**Files affected:** `styles.css`

---

## Connections & Dependencies

### Files That Reference This Area

- All 10 HTML pages include `js/script.js` and `styles.css` — changes propagate automatically
- `design.html` is the only page with expanding card triggers
- `server.js` helmet config affects Express-served responses only (App Engine uses `app.yaml` headers)

### Updates Needed for Consistency

- `outputs/harden-knowledge.md` — update Fix Effectiveness Tracker after implementation
- Expanding card JS references `z-index: 1001` — must update to match new layer

### Impact on Existing Workflows

- **CSP enabled:** After Step 7, any future inline `<script>` tags will be blocked. All JS must be in external files or use nonces.
- **Button element change:** The `.expanding-card-trigger` is now a `<button>` instead of `<a>`. The JS `e.preventDefault()` in the click handler still works on buttons, and the CSS already uses `display: block; width: 100%; height: 100%` which applies to both. The button reset CSS ensures no browser default button styles leak through.

---

## Validation Checklist

- [ ] Zero `transition: all` instances remain in `styles.css` (grep returns no matches)
- [ ] Zero `will-change` on `.reveal*` classes (only on infinite animations like blobs/header)
- [ ] No z-index value above 600 in `styles.css` (excluding vendor files)
- [ ] Zero `document.write` instances in any HTML file
- [ ] Zero `javascript:void(0)` instances in any HTML file
- [ ] Copyright year renders correctly in all 10 page footers
- [ ] Expanding cards still open/close correctly on design.html
- [ ] Navbar affix transition is smooth (height, background, shadow)
- [ ] Hamburger icon animates to X correctly on mobile
- [ ] Overlay cards hover correctly (background darkens, text slides up)
- [ ] Page transitions work without visual jump on scroll
- [ ] `server.js` starts without errors with CSP enabled
- [ ] No regressions in mobile menu, dropdown menus, or FAQ accordion

---

## Success Criteria

The implementation is complete when:

1. All 7 Medium findings (M1–M7) are resolved and verifiable
2. CSP is enabled in helmet (bonus, enabled by M5 completion)
3. `grep 'transition: all' styles.css` returns zero matches
4. `grep 'document.write' *.html` returns zero matches
5. `grep 'javascript:void' *.html` returns zero matches
6. No visual regressions in any page component

---

## Notes

- **M8 (Formspree placeholder ID)** is deliberately excluded — it requires the user to create an account and provide a real ID. This is a manual action, not a code fix.
- **Low findings** (L1–L5) are not in scope. L4 (jQuery removal) is a larger effort that should be its own plan.
- After this plan is implemented, a third `/harden` pass should confirm all Medium items are resolved and verify the CSP configuration works correctly.
- The CSP `styleSrc: 'unsafe-inline'` is a pragmatic choice — the expanding card and page transition code sets inline styles via JS. To remove `unsafe-inline` would require refactoring all JS-set styles to use CSS classes instead, which is a separate effort.

---

## Implementation Notes

**Implemented:** 2026-03-04

### Summary

All 7 Medium findings (M1–M7) resolved plus CSP re-enabled in helmet. Replaced 13 `transition: all` with specific property transitions, removed `will-change` from 3 scroll reveal classes, normalized z-index to a 0–600 layer system (CSS + JS), replaced `document.write()` in all 10 footers with `<span class="copyright-year">` + JS init, converted 6 `javascript:void(0)` links to `<button>` elements with CSS reset, replaced 800ms scroll timeout with `scrollend` event + 1000ms fallback, and enabled CSP in helmet with specific directives.

### Deviations from Plan

- Step 8 (mobile media query z-indexes) was completed as part of Step 3 since the mobile z-index values were naturally encountered during the full z-index normalization sweep.
- `.footer` z-index (999 → 10) was normalized but wasn't explicitly listed in the plan's Step 3 table — added during implementation as it was above the 600 ceiling.

### Issues Encountered

None.
