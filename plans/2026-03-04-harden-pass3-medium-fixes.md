# Plan: Fix Medium Findings from Harden Report Pass 3

**Created:** 2026-03-04
**Status:** Implemented
**Request:** Fix all 4 Medium findings (M1–M4) from the third harden report.

---

## Overview

### What This Plan Accomplishes

Makes the FAQ accordion keyboard-accessible (WCAG 2.1 AA), fixes 6 duplicate `class` attributes that silently drop the `.card-icon` class, deduplicates overlay click listeners on expanding cards, and adds a navigation-in-progress guard to prevent double-click race conditions during page transitions.

### Why This Matters

M1 (FAQ accessibility) is the most impactful — keyboard and screen reader users currently cannot interact with 37 FAQ questions across 3 pages. M2 (duplicate classes) is a markup bug that silently breaks styling. M3 and M4 are defensive improvements that eliminate unnecessary event listener accumulation and race conditions.

---

## Current State

### Relevant Existing Structure

- `js/script.js` — `initInlineFAQ()` at lines 643–662 uses click-only handlers on `<div>` elements; `ExpandingCard` constructor at lines 75–79 attaches per-instance overlay listeners; `handlePageTransition()` at line 476 has no concurrency guard
- `design.html` — 4 inline FAQ questions (lines 492–510)
- `solutions.html` — 4 inline FAQ questions (lines 316–334), 3 duplicate class attributes (lines 277, 287, 297)
- `faq.html` — 29 inline FAQ questions
- `services.html` — 3 duplicate class attributes (lines 172, 181, 190)
- `styles.css` — `.inline-faq-question` styled at line 2264 with padding, cursor, font-weight, hover color, `::after` plus/cross indicator

### Gaps or Problems Being Addressed

| Finding | Problem |
|---------|---------|
| M1 | 37 `.inline-faq-question` divs have no `tabindex`, `role`, `aria-expanded`, or keyboard event handling — WCAG 2.1 AA failure |
| M2 | 6 `<span>` elements have two `class` attributes — second (`card-icon`) is silently ignored |
| M3 | Each of the 6 `ExpandingCard` instances adds its own click listener to the shared `#cardOverlay` — 6 listeners fire per click, never cleaned up |
| M4 | Rapid double-click on nav links starts two concurrent page transitions with no guard |

---

## Proposed Changes

### Summary of Changes

- **M1:** Convert 37 `.inline-faq-question` divs to `<button>` elements across 3 HTML files, add button reset CSS, add `aria-expanded` toggling in JS
- **M2:** Merge duplicate `class` attributes on 6 elements in services.html and solutions.html
- **M3:** Move overlay click listener out of `ExpandingCard` constructor into the DOMContentLoaded init block using event delegation
- **M4:** Add `isNavigating` module-level guard in `handlePageTransition`

### New Files to Create

None.

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `styles.css` | Add button reset for `.inline-faq-question` |
| `js/script.js` | Update `initInlineFAQ()` for `aria-expanded`, move overlay listener to init block, add navigation guard |
| `design.html` | Convert 4 FAQ question divs to buttons |
| `solutions.html` | Convert 4 FAQ question divs to buttons, fix 3 duplicate class attributes |
| `faq.html` | Convert 29 FAQ question divs to buttons |
| `services.html` | Fix 3 duplicate class attributes |

### Files to Delete

None.

---

## Design Decisions

### Key Decisions Made

1. **Convert FAQ questions to `<button>` rather than adding `tabindex`/`role` to divs:** Native `<button>` elements get keyboard interaction (Enter/Space) for free. No need for a keydown handler. This is the WAI-ARIA recommended approach and matches the expanding card trigger pattern already established.

2. **Button reset CSS on `.inline-faq-question` directly:** Since ALL `.inline-faq-question` elements will now be buttons, the reset can go on the base selector rather than a `button.inline-faq-question` qualified selector. This keeps specificity simple. The existing styles (padding, cursor, color, font-weight, hover, ::after) all carry over unchanged.

3. **Event delegation for overlay:** A single listener on `#cardOverlay` that finds and collapses the expanded card. This eliminates N listeners and makes the code simpler.

4. **Module-level `isNavigating` flag:** Simple boolean guard set at the start of `handlePageTransition`, never needs resetting (page navigates away). If `startFadeTransition` is called but navigation doesn't happen (unlikely edge case), the flag blocks further transitions — which is the correct fail-safe behavior.

### Alternatives Considered

- **`tabindex="0"` + `role="button"` + keydown handler on divs:** More code, less semantic, requires manual keyboard handling. Rejected in favor of native `<button>`.
- **Removing overlay listener from ExpandingCard and using CSS `pointer-events` instead:** Would require restructuring the overlay/card DOM relationship. Over-engineering.

### Open Questions

None.

---

## Step-by-Step Tasks

### Step 1: Fix duplicate `class` attributes (M2)

The simplest fix — merge two `class` attributes into one on 6 elements.

**In `services.html`:**

| Line | Before | After |
|------|--------|-------|
| 172 | `<span class="ti ti-calendar" class="card-icon"></span>` | `<span class="ti ti-calendar card-icon"></span>` |
| 181 | `<span class="ti ti-shopping-cart" class="card-icon"></span>` | `<span class="ti ti-shopping-cart card-icon"></span>` |
| 190 | `<span class="ti ti-magnet" class="card-icon"></span>` | `<span class="ti ti-magnet card-icon"></span>` |

**In `solutions.html`:**

| Line | Before | After |
|------|--------|-------|
| 277 | `<span class="ti ti-package" class="card-icon"></span>` | `<span class="ti ti-package card-icon"></span>` |
| 287 | `<span class="ti ti-loop" class="card-icon"></span>` | `<span class="ti ti-loop card-icon"></span>` |
| 297 | `<span class="ti ti-ruler-pencil" class="card-icon"></span>` | `<span class="ti ti-ruler-pencil card-icon"></span>` |

**Files affected:** `services.html`, `solutions.html`

---

### Step 2: Convert FAQ question divs to buttons (M1 — HTML)

Replace all `<div class="inline-faq-question">` with `<button type="button" class="inline-faq-question" aria-expanded="false">` and corresponding `</div>` closing tags with `</button>`.

This is a bulk find-and-replace across 3 files:

**Opening tag** (all files):
```
Before: <div class="inline-faq-question">
After:  <button type="button" class="inline-faq-question" aria-expanded="false">
```

**Closing tag** — these are the closing `</div>` that immediately follow the question text on the same line or next line. Since the question text and closing tag are on the same line (e.g., `<div class="inline-faq-question">How long does it take?</div>`), this is a single-line replacement.

The structure is consistent: `<div class="inline-faq-question">Question text</div>` — all on one line.

**Replace pattern across all 3 files:**
- Find: `<div class="inline-faq-question">`
- Replace with: `<button type="button" class="inline-faq-question" aria-expanded="false">`

Then for each of these, the closing `</div>` on the same line becomes `</button>`. Since the question text is always on a single line between the tags, a regex replacement works: replace `<div class="inline-faq-question">(.*?)</div>` with `<button type="button" class="inline-faq-question" aria-expanded="false">\1</button>`.

**Counts:**
- `design.html` — 4 replacements
- `solutions.html` — 4 replacements
- `faq.html` — 29 replacements

**Files affected:** `design.html`, `solutions.html`, `faq.html`

---

### Step 3: Add button reset CSS for `.inline-faq-question` (M1 — CSS)

Add button reset properties to the existing `.inline-faq-question` rule in `styles.css` at line 2264. Since all instances are now buttons, add the reset properties directly to the base rule rather than creating a separate qualified selector.

**Before (line 2264):**
```css
.inline-faq-question {
  padding: 1.25rem 2.5rem 1.25rem 1rem;
  cursor: pointer;
  position: relative;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  transition: color 0.3s ease;
}
```

**After:**
```css
.inline-faq-question {
  display: block;
  width: 100%;
  background: none;
  border: none;
  font: inherit;
  text-align: left;
  padding: 1.25rem 2.5rem 1.25rem 1rem;
  cursor: pointer;
  position: relative;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  transition: color 0.3s ease;
}
```

The added properties (`display: block`, `width: 100%`, `background: none`, `border: none`, `font: inherit`, `text-align: left`) reset default button styling. The existing properties remain unchanged.

**Files affected:** `styles.css`

---

### Step 4: Update `initInlineFAQ()` to toggle `aria-expanded` (M1 — JS)

Modify the click handler in `initInlineFAQ()` to toggle `aria-expanded` on the question button when opening/closing.

**Before (line 643–662):**
```javascript
function initInlineFAQ() {
    const faqItems = document.querySelectorAll('.inline-faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.inline-faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const parent = item.closest('.inline-faq');
                // Close other items in the same FAQ block
                if (parent) {
                    parent.querySelectorAll('.inline-faq-item.active').forEach(activeItem => {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                        }
                    });
                }
                item.classList.toggle('active');
            });
        }
    });
}
```

**After:**
```javascript
function initInlineFAQ() {
    const faqItems = document.querySelectorAll('.inline-faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.inline-faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const parent = item.closest('.inline-faq');
                // Close other items in the same FAQ block
                if (parent) {
                    parent.querySelectorAll('.inline-faq-item.active').forEach(activeItem => {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                            activeItem.querySelector('.inline-faq-question').setAttribute('aria-expanded', 'false');
                        }
                    });
                }
                item.classList.toggle('active');
                question.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
            });
        }
    });
}
```

Changes:
- When closing sibling items, also set their `aria-expanded` to `false`
- After toggling, set `aria-expanded` based on the `active` class state

**Files affected:** `js/script.js`

---

### Step 5: Move overlay click listener to event delegation (M3)

**In the `ExpandingCard` constructor**, remove the overlay click listener (lines 75–79).

**Before (lines 75–79 in constructor):**
```javascript
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay && !this.isAnimating && this.isExpanded) {
                this.collapse();
            }
        });
```

Remove these 4 lines entirely.

**In the DOMContentLoaded handler**, after the card initialization block (after line 305), add a single delegated overlay listener:

**After the existing card init (line 301–305):**
```javascript
    // Initialize expanding cards
    const cards = document.querySelectorAll('.expanding-card');
    cards.forEach(card => {
        new ExpandingCard(card);
    });
```

**Add immediately after:**
```javascript

    // Overlay click to close expanded card (single delegated listener)
    const cardOverlay = document.getElementById('cardOverlay');
    if (cardOverlay) {
        cardOverlay.addEventListener('click', function(e) {
            if (e.target === cardOverlay) {
                const expandedCard = document.querySelector('.expanding-card.is-expanded');
                if (expandedCard) {
                    expandedCard.querySelector('.expanding-card-close').click();
                }
            }
        });
    }
```

This replaces N per-instance listeners with one delegated listener. The logic is simpler too — it finds whichever card is expanded and clicks its close button, reusing the existing close/collapse logic.

**Files affected:** `js/script.js`

---

### Step 6: Add navigation-in-progress guard (M4)

Add a module-level flag before the `handlePageTransition` function and check it at the top.

**Before (line 476):**
```javascript
function handlePageTransition(targetUrl) {
    const body = document.body;
    const currentScrollY = window.scrollY;
```

**After:**
```javascript
var isNavigating = false;

function handlePageTransition(targetUrl) {
    if (isNavigating) return;
    isNavigating = true;

    const body = document.body;
    const currentScrollY = window.scrollY;
```

The flag never needs resetting — the page navigates away. If navigation is aborted for any reason, the guard correctly prevents further transition attempts (fail-safe).

**Files affected:** `js/script.js`

---

## Connections & Dependencies

### Files That Reference This Area

- All 10 HTML pages include `js/script.js` and `styles.css` — changes propagate automatically
- Only `design.html`, `solutions.html`, and `faq.html` have inline FAQ components
- Only `design.html` has expanding cards (overlay listener change only matters there)
- `services.html` and `solutions.html` have the duplicate class bug

### Updates Needed for Consistency

- `outputs/harden-knowledge.md` — update Fix Effectiveness Tracker after implementation

### Impact on Existing Workflows

- **FAQ button conversion:** The `.inline-faq-question` elements change from `<div>` to `<button>`. The existing CSS (padding, hover, ::after indicator) applies to both. The button reset CSS ensures no browser defaults leak. Keyboard users can now Tab to questions and press Enter/Space to toggle.
- **Overlay delegation:** The collapse behavior is identical — only the listener attachment mechanism changes. No visual or functional difference.
- **Navigation guard:** Prevents the second of two rapid clicks from starting a competing transition. First click wins.

---

## Validation Checklist

- [ ] Zero `<div class="inline-faq-question">` instances remain (all converted to `<button>`)
- [ ] All 37 FAQ buttons have `aria-expanded="false"` in HTML
- [ ] `aria-expanded` toggles correctly when FAQ items open/close
- [ ] FAQ questions are keyboard-focusable and respond to Enter/Space
- [ ] FAQ visual appearance unchanged (padding, hover color, +/x indicator)
- [ ] Zero duplicate `class` attributes in services.html and solutions.html
- [ ] `.card-icon` class is applied to all 6 icon spans
- [ ] Only 1 click listener on `#cardOverlay` (not 6)
- [ ] Expanding cards still open/close correctly on design.html
- [ ] Overlay click still closes expanded card
- [ ] Escape key still closes expanded card
- [ ] Rapid double-click on nav links does not cause double transition
- [ ] No JS errors in console on any page

---

## Success Criteria

The implementation is complete when:

1. All 4 Medium findings (M1–M4) are resolved
2. `grep 'div class="inline-faq-question"' *.html` returns zero matches
3. `grep 'class=".*" class="' services.html solutions.html` returns zero matches (excluding nav items with nested `<a>` tags that legitimately have class on both the `<li>` and `<a>`)
4. FAQ accordion is fully keyboard-accessible with proper ARIA state

---

## Notes

- **Low findings** (L1–L11) from pass 3 are not in scope. L1 (expanding card `aria-expanded`), L2 (footer `<a>` without href), and L3 (heading hierarchy) are accessibility items that could be bundled into a future accessibility-focused plan.
- The `closeBtn` null-check (L4) and `navbar` null-guard (L5) are one-line defensive fixes that could be picked up opportunistically during implementation if convenient, but are not required.
- After this plan is implemented, a 4th `/harden` pass should confirm all Medium items are resolved.

---

## Implementation Notes

**Implemented:** 2026-03-04

### Summary

All 4 Medium findings resolved: converted 37 FAQ question divs to buttons with `aria-expanded` toggling across 3 HTML files, added button reset CSS, fixed 6 duplicate `class` attributes in services.html and solutions.html, moved overlay click listener from per-instance to single delegated listener, and added `isNavigating` guard to prevent double-click navigation race.

### Deviations from Plan

None.

### Issues Encountered

None.
