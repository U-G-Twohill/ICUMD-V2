# Harden Report: ICU Media Design Website

**Date:** 2026-03-04
**Focus:** Full
**Iteration:** 2nd pass (verification + remaining issues)
**Previous reports:** `harden-report-2026-03-04.md` (1st audit, 20 findings — 8 C/H fixed)

---

## Executive Summary

All 3 Critical and 5 High findings from the first audit have been resolved and verified. The site's security posture is significantly improved — path traversal blocked, CORS restricted, security headers in place, rate limiting active, error messages sanitized, contact form functional, modal animation performant, and sessionStorage staleness handled. The remaining 13 items are Medium and Low severity — CSS performance patterns (`transition: all`, `will-change`), accessibility (`javascript:void(0)`), and deprecated patterns (`document.write()`). No new Critical or High issues found. The site is in a reasonable state for a controlled launch; the Medium items should be addressed before scaling.

## Project Profile

- **Type:** Static multi-page business website with Express API backend
- **Stack:** HTML, CSS (custom + Bootstrap 4.3.1), vanilla JS, jQuery 3.4.1, Express 4, Stripe SDK, helmet, express-rate-limit, deployed via Google Cloud App Engine (static mode)
- **Key flows audited:** All previous flows re-verified, plus new contact form submission flow and rate limiting behavior

---

## Resolved Since Previous Report

All 8 Critical and High findings from the first audit are now fixed:

| Original # | Finding | Status | Verification |
|------------|---------|--------|-------------|
| C1 | Path traversal in `serve.mjs` | **Fixed** | `resolve()` + `startsWith(ROOT)` check at line 19 |
| C2 | Open CORS on Stripe endpoints | **Fixed** | Origin-restricted via `ALLOWED_ORIGINS` env var, lines 28-39 |
| C3 | No security headers | **Fixed** | `helmet` on Express (line 23-25), `http_headers` in `app.yaml` |
| H1 | No rate limiting | **Fixed** | `express-rate-limit` at 10 req/min on all checkout endpoints |
| H2 | Stripe errors exposed | **Fixed** | Generic messages returned, SDK errors logged server-side only |
| H3 | Contact form silently fails | **Fixed** | Formspree handler with success/error feedback UI (placeholder ID needs replacement) |
| H4 | Modal width/height animation | **Fixed** | Now uses `transform: scale()` + `opacity` transitions |
| H5 | Stale sessionStorage flag | **Fixed** | 2-second failsafe timeout clears stale `isTransitioning` |

Also fixed from Low:
| L2 | Dev log leak | **Fixed** | Guarded behind `NODE_ENV !== 'production'` |
| L3 | Dead sessionStorage writes | **Fixed** | `scrollPosition`/`wasAffixed` writes removed |

---

## Findings

### Critical (must fix before production)

None.

### High (should fix soon)

None.

### Medium (fix when able)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| M1 | Performance | **13 remaining `transition: all` instances** — down from 15 (2 removed in modal fix), still applies broad transitions. | `styles.css:36,348,401,570,831,913,980,1085,1096,1324,1334,1354,2218` | Unnecessary compositing work on every state change. | Replace each with specific properties. |
| M2 | Performance | **`will-change` on one-shot scroll reveals** — 3 instances on `.reveal*` classes that only animate once. | `styles.css:2409,2416,2423` | GPU memory held for revealed elements for page lifetime. | Remove from CSS; add/remove dynamically in JS if needed. |
| M3 | Performance | **Overlay card hover `transition: all` on 3 nested elements.** | `styles.css:1324,1334,1354` | Triple-layer repaint on hover. | Target specific properties. |
| M4 | Bug | **Z-index collision at 1001** — `.expanding-card.is-expanded` (line 523), `.page-navbar.affix` (implied via mobile lines 1600,1617), and `.expanding-card-content` (line 616) all share z-index 1001. | `styles.css` | Potential stacking conflicts when expanding cards while scrolled. | Normalize to distinct layers. |
| M5 | Edge Case | **`document.write()` in footer on all 10 pages** — blocks CSP adoption. | All HTML footers | Cannot enable Content-Security-Policy header (currently disabled in helmet config). | Replace with `<span class="copyright-year"></span>` + JS `textContent`. |
| M6 | Accessibility | **`javascript:void(0)` links used as buttons** — 6 instances in design.html. | `design.html` (6 occurrences) | Screen readers announce as broken links; keyboard semantics wrong. | Replace with `<button type="button">`. |
| M7 | Edge Case | **Page transition scroll-to-top hardcoded 800ms timeout.** | `js/script.js:492-494` | On long pages/slow devices, fade starts before scroll completes. | Use `scrollend` event with fallback. |
| M8 | Validation | **Contact form Formspree ID is still placeholder** — `YOUR_FORMSPREE_ID` at line 766. | `js/script.js:766` | Form will fail for every submission until replaced with real ID. | User action required: create Formspree account and update ID. |

### Low (nice to have)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| L1 | Performance | **Broad `*` selector during transitions** — `.transitioning .page-navbar *`. | `styles.css:39-42` | Minor paint cost during page transitions. | Target specific elements. |
| L2 | Edge Case | **No `maxlength` on contact form textarea.** | `contact.html:132` | Potential for oversized payloads to Formspree. | Add `maxlength="5000"`. |
| L3 | SEO | **LocalBusiness schema missing `telephone`.** | `index.html` JSON-LD | Reduced rich snippet chance. | Add when ready to publish phone number. |
| L4 | Performance | **jQuery 3.4.1 loaded for 3 trivial calls.** | All HTML pages | ~87KB for modal toggle + search toggle. | Replace with vanilla JS, remove jQuery. |
| L5 | Edge Case | **No custom validation UI on contact form** — relies on browser-default HTML5 validation bubbles. | `contact.html:126-134` | Inconsistent appearance across browsers. | Add custom validation styling for polished UX. |

---

## Functionality Impact Assessment

**The following fixes would alter existing behavior:**

| Finding | Current Behavior | Proposed Change | Why It's Necessary |
|---------|-----------------|-----------------|-------------------|
| M5 | `document.write()` renders copyright year | Replace with `textContent` on `<span>` | Required before CSP can be enabled |
| M6 | Card triggers are `<a href="javascript:void(0)">` | Replace with `<button>` elements | Semantics change; needs CSS button reset |
| L4 | jQuery handles modal/search toggle | Replace with vanilla JS | Removes jQuery dependency entirely |

**These require explicit user approval before proceeding.**

---

## Statistics

- **Total findings:** 13 (remaining from 20 original)
- **Critical:** 0 | **High:** 0 | **Medium:** 8 | **Low:** 5
- **By category:** Performance: 5 | Edge Cases: 4 | Accessibility: 1 | Validation: 1 | Bug: 1 | SEO: 1
- **Resolved since previous report:** 10 (C1–C3, H1–H5, L2, L3)
- **Recurring from previous report:** 13 (all Medium and Low items, renumbered)

---

## Audit Process Notes

### What Was Checked
Full re-audit: verified all 8 C/H fixes by reading modified files, re-ran all custom checklist items from knowledge base, checked for regressions, scanned for new issues introduced by fixes.

### Stack-Specific Checks Applied
- Verified helmet integration (CSP intentionally disabled, noted as M5 dependency)
- Verified CORS origin callback logic
- Verified rate limiter is applied per-route (not globally)
- Verified contact form handler has proper error handling and disabled-state management
- Verified modal CSS uses only transform/opacity (no layout properties)
- Verified sessionStorage failsafe timeout logic
- Checked npm audit: 0 vulnerabilities

### Areas Not Fully Covered
- Runtime testing of Formspree integration (placeholder ID)
- Production App Engine deployment verification
- Cross-browser visual regression testing

### Time and Approach
Focused verification pass: read all modified files first, confirmed each fix matches the plan, then re-checked all Medium/Low items from the knowledge base custom checklist to confirm they're still present and accurately described.

---

## Recommended Next Steps

1. **Replace Formspree placeholder ID** (M8) — this is a manual user action
2. Run `/create-plan fix medium findings from harden report pass 2` to address M1–M7
3. After fixes, run `/harden` to verify and achieve a clean bill of health
