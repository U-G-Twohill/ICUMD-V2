# Harden Report: ICU Media Design Website

**Date:** 2026-03-04
**Focus:** Full
**Iteration:** 4th pass (verification of pass 3 Medium fixes + new issue discovery)
**Previous reports:** `harden-report-2026-03-04.md` (1st), `harden-report-2026-03-04-pass2.md` (2nd), `harden-report-2026-03-04-pass3.md` (3rd)

---

## Executive Summary

All 4 Medium findings from pass 3 have been resolved and verified — 19 fixes across all 4 passes confirmed with zero regressions. The codebase has no Critical or High vulnerabilities. Three new Medium findings were discovered, all related to the CSP configuration being too restrictive for the site's actual resource requirements: Google Fonts will be blocked, and the inline page-transition script will be silently suppressed. These are straightforward CSP directive additions. The dev server also has a crash vector on malformed URLs. After these are fixed, the site will have a clean bill of health.

## Project Profile

- **Type:** Static multi-page business website with Express API backend
- **Stack:** HTML, CSS (custom + Bootstrap 4.3.1), vanilla JS, jQuery 3.4.1, Express 4, Stripe SDK, helmet, express-rate-limit
- **Key flows audited:** All previous fixes re-verified (19 items), CSP directive completeness, client JS race conditions, HTML semantics

---

## Resolved Since Previous Report

All 4 Medium findings from pass 3:

| Original # | Finding | Status | Verification |
|------------|---------|--------|-------------|
| M1 | FAQ questions not keyboard-accessible | **Fixed** | 37 buttons with `aria-expanded` across 3 files, button reset CSS, JS toggling |
| M2 | Duplicate `class` attributes (6 elements) | **Fixed** | All merged to single attribute in services.html and solutions.html |
| M3 | Overlay click listeners accumulate | **Fixed** | Single delegated listener in init block; per-instance listeners removed |
| M4 | Double-click navigation race | **Fixed** | `isNavigating` module-level guard in `handlePageTransition` |

---

## Findings

### Critical (must fix before production)

None.

### High (should fix soon)

None.

### Medium (fix when able)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| M1 | Functionality | **CSP blocks Google Fonts** — `styleSrc` and `fontSrc` don't include `fonts.googleapis.com` / `fonts.gstatic.com`. The `@import` in `styles.css:3` will be blocked. | `server.js:28,30` | Site falls back to sans-serif, losing Quicksand branding when served via Express. | Add `"https://fonts.googleapis.com"` to `styleSrc` and `"https://fonts.gstatic.com"` to `fontSrc`. |
| M2 | Functionality | **CSP blocks inline transition script** — `scriptSrc: ["'self'"]` blocks the inline `<script>` on every page that adds `.transitioning` class from sessionStorage. | `server.js:27`, all HTML pages (e.g., `design.html:84`) | Page transition prevention script silently fails — flash of unstyled content during navigation when served via Express. | Either move inline script to an external file, or add its SHA-256 hash to `scriptSrc`. |
| M3 | Bug | **`decodeURIComponent` crash in dev server** — malformed percent-encoding (e.g., `/%E0%A4`) throws `URIError` with no try/catch, crashing serve.mjs. | `serve.mjs:17` | Dev server crashes on malformed URLs from crawlers or fuzzing. | Wrap in try/catch, return 400. |

### Low (nice to have)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| L1 | Defensive | **`isNavigating` not reset on same-page early return** — if `currentPage === targetPage`, the guard stays locked. Currently safe because `initPageTransitions` filters same-page links upstream. | `js/script.js:495-500` | No current impact; defensive concern if upstream filter changes. | Add `isNavigating = false;` before the `return` on line 500. |
| L2 | Defensive | **Escape key handler assumes `.expanding-card-close` exists** — no null check before `.click()`. | `js/script.js:320` | `TypeError` if card DOM is malformed. Unlikely in practice. | Add `if (closeBtn) closeBtn.click();` |
| L3 | Configuration | **Formspree placeholder ID** (recurring) | `js/script.js:790` | Contact form non-functional. | User action: replace with real ID. |
| L4 | Performance | **jQuery 3.4.1 for 3 trivial calls** (recurring) | All HTML pages | ~87KB overhead. | Separate removal effort. |
| L5 | Configuration | **`puppeteer` in production deps** (recurring) | `package.json` | ~170MB bloat in deployment. | Move to `devDependencies`. |
| L6 | Configuration | **Missing HSTS in app.yaml** (recurring) | `app.yaml` | No Strict-Transport-Security header. | Add `Strict-Transport-Security: max-age=31536000; includeSubDomains`. |
| L7 | Accessibility | **Footer `<a>` without `href`** (recurring) | All footers | Screen readers announce broken link. | Change to `<span>`. |
| L8 | Accessibility | **Overlay card `<h2>` inside `<h2>` sections** (recurring) | `solutions.html:166-259` | Broken heading hierarchy. | Change to `<h3>`. |

---

## Functionality Impact Assessment

**The following fixes would alter existing behavior:**

| Finding | Current Behavior | Proposed Change | Why It's Necessary |
|---------|-----------------|-----------------|-------------------|
| M2 | Inline `<script>` runs immediately on page load | Move to external file or add hash to CSP | CSP currently blocks it silently when served via Express |

**This requires explicit user approval before proceeding.**

---

## Statistics

- **Total findings:** 11
- **Critical:** 0 | **High:** 0 | **Medium:** 3 | **Low:** 8
- **By category:** Functionality: 2 | Bug: 1 | Defensive: 2 | Configuration: 3 | Performance: 1 | Accessibility: 2
- **Resolved since previous report:** 4 (M1–M4 from pass 3)
- **Recurring from previous reports:** 6 (L3–L8)
- **New findings:** 5 (M1–M3, L1–L2)

---

## Audit Process Notes

### What Was Checked
Full re-audit: verified all 19 fixes from passes 1–3, focused on CSP directive completeness against actual resource requirements (fonts, inline scripts, connect targets), re-examined client JS for race conditions and null safety, re-checked HTML semantics.

### Stack-Specific Checks Applied
- CSP directives validated against all `@import`, `<script>`, `fetch()`, and font references in the actual codebase
- Inline script detection across all HTML pages
- Event listener patterns for leaks and race conditions

### Areas Not Fully Covered
- Runtime CSP testing in browser (static analysis only)
- Cross-browser visual regression testing
- Production App Engine deployment (app.yaml headers separate from Express helmet)

### Time and Approach
Single comprehensive agent read all key files (script.js full, styles.css, design.html, services.html, solutions.html, faq.html, server.js, serve.mjs). The CSP findings emerged from cross-referencing the `server.js` directives against actual resource imports in the HTML and CSS files — this is a new check pattern not used in previous passes.

---

## Recommended Next Steps

1. Fix the 3 Medium CSP/server findings — these are small, targeted changes
2. Address Low findings at your discretion (L1 and L2 are one-liners)
3. Run `/harden` one more time to confirm clean bill of health
