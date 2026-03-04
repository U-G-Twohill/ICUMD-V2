# Harden Report: ICU Media Design Website

**Date:** 2026-03-04
**Focus:** Full
**Iteration:** 3rd pass (verification of Medium fixes + new issue discovery)
**Previous reports:** `harden-report-2026-03-04.md` (1st), `harden-report-2026-03-04-pass2.md` (2nd)

---

## Executive Summary

All 7 Medium findings (M1–M7) from the second audit have been resolved and verified. CSP is now enabled in helmet. The codebase has no Critical or High security vulnerabilities. The remaining findings are Medium and Low severity — accessibility gaps (keyboard-inaccessible FAQ accordion, missing ARIA attributes), a markup bug (duplicate `class` attributes), and minor defensive coding improvements. The site is in good shape for a controlled launch. The Formspree placeholder ID (M8 from pass 2) remains the only user-action item blocking full contact form functionality.

## Project Profile

- **Type:** Static multi-page business website with Express API backend
- **Stack:** HTML, CSS (custom + Bootstrap 4.3.1), vanilla JS, jQuery 3.4.1, Express 4, Stripe SDK, helmet, express-rate-limit
- **Key flows audited:** All previous fixes re-verified, CSP configuration validated, full client JS audit, HTML semantics and accessibility review

---

## Resolved Since Previous Report

All 7 Medium findings from pass 2 plus the CSP bonus:

| Original # | Finding | Status | Verification |
|------------|---------|--------|-------------|
| M1/M3 | `transition: all` (13 instances) | **Fixed** | 0 instances remain in styles.css |
| M2 | `will-change` on `.reveal*` classes | **Fixed** | Removed; only infinite animations retain `will-change` |
| M4 | Z-index collision at 1001 | **Fixed** | Normalized to 0–600 layer system, max is 600 (`.modalBox`) |
| M5 | `document.write()` in 10 footers | **Fixed** | Replaced with `<span class="copyright-year">` + JS `textContent` |
| M6 | `javascript:void(0)` links (6 in design.html) | **Fixed** | Converted to `<button type="button">` with CSS reset |
| M7 | Hardcoded 800ms scroll timeout | **Fixed** | Uses `scrollend` event with 1000ms fallback |
| Bonus | CSP disabled in helmet | **Fixed** | CSP directives configured (`script-src 'self'`, `style-src 'unsafe-inline'`, etc.) |

---

## Findings

### Critical (must fix before production)

None.

### High (should fix soon)

None.

### Medium (fix when able)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| M1 | Accessibility | **FAQ questions not keyboard-accessible** — 37 `.inline-faq-question` elements across 3 pages are `<div>` with only click handlers. No `tabindex`, `role`, `aria-expanded`, or keyboard event handling. | `design.html:492-510`, `solutions.html:316-334`, `faq.html` (29 instances), `js/script.js:643-662` | Keyboard and screen reader users cannot interact with FAQ accordions at all. WCAG 2.1 AA failure. | Convert to `<button>` elements (preferred) or add `tabindex="0"` + `role="button"` + `aria-expanded` + keydown handler. |
| M2 | Bug | **Duplicate `class` attributes on 6 elements** — second `class` attribute is silently ignored by HTML parser. | `services.html:172,181,190`, `solutions.html:277,287,297` | `.card-icon` class never applied; any CSS targeting it has no effect. | Merge into single attribute: `class="ti ti-package card-icon"`. |
| M3 | Bug | **Overlay click listeners accumulate** — each `ExpandingCard` instance adds its own click listener to the shared `#cardOverlay` element. With 6 cards, 6 listeners fire on every overlay click. | `js/script.js:75-79` | N-1 unnecessary function calls per overlay click. Listeners never removed. | Move overlay listener to initialization block using event delegation. |
| M4 | Edge Case | **Double-click navigation race** — rapid clicks on two nav links can start two concurrent page transitions. No guard prevents the second call. | `js/script.js:476-510` | Two `scrollend` listeners or fallback timeouts queued; second navigation overwrites first. Visual glitch possible. | Add module-level `isNavigating` guard at top of `handlePageTransition`. |

### Low (nice to have)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| L1 | Accessibility | **Expanding card buttons lack `aria-expanded`** — triggers are now `<button>` (good) but don't communicate open/closed state. | `design.html:208,238,268,298,350,403` | Screen readers don't announce expansion state. | Add `aria-expanded="false"`, toggle via JS on expand/collapse. |
| L2 | Accessibility | **Footer `<a>` without `href`** — `<a>ICU Media Design</a>` in all 10 footers. | All HTML footers | Screen readers announce as broken link. | Replace with `<span>` or add `href="index.html"`. |
| L3 | Accessibility | **Overlay card heading hierarchy** — `<h2>` titles inside sections that are themselves under `<h2>` headings. | `solutions.html:166-259` (9 instances) | Broken heading hierarchy; screen reader/SEO impact. | Change to `<h3 class="title">`. |
| L4 | Defensive | **`closeBtn` not null-checked in Escape handler** | `js/script.js:312-313` | If `.expanding-card-close` is missing, `TypeError` thrown. | Add `if (closeBtn) closeBtn.click();` |
| L5 | Defensive | **`navbar` used without null guard in scroll handler** | `js/script.js:319-331` | On pages without `.page-navbar`, every scroll event throws `TypeError`. | Wrap scroll listener attachment in `if (navbar)` check. |
| L6 | Defensive | **`decodeURIComponent` can throw in dev server** — malformed percent-encoding (e.g., `/%ZZ`) crashes serve.mjs. | `serve.mjs:17-18` | Dev server crashes on malformed URLs. | Wrap handler in try/catch, return 400. |
| L7 | Defensive | **Hash selector could throw** — `document.querySelector(hash)` throws if hash contains invalid CSS selector characters. | `js/script.js:608,628` | `DOMException` on numeric IDs or special characters. | Use `document.getElementById(hash.slice(1))` instead. |
| L8 | Configuration | **Formspree placeholder ID still present** (recurring from M8 pass 2) | `js/script.js:778` | Contact form non-functional until replaced. | User action required: create Formspree account and update ID. |
| L9 | Performance | **jQuery 3.4.1 loaded for 3 trivial calls** (recurring from L4 pass 2) | All HTML pages | ~87KB overhead. | Replace with vanilla JS, remove jQuery. Separate effort. |
| L10 | Configuration | **`puppeteer` in production dependencies** — downloads ~170MB Chromium. Not used by server.js. | `package.json` | Bloated deployment artifact on App Engine. | Move to `devDependencies` or remove. |
| L11 | Configuration | **Missing HSTS header in app.yaml** | `app.yaml` | No Strict-Transport-Security header. App Engine forces HTTPS at infra level, but HSTS adds defense-in-depth. | Add `Strict-Transport-Security: max-age=31536000; includeSubDomains`. |

---

## Functionality Impact Assessment

**The following fixes would alter existing behavior:**

| Finding | Current Behavior | Proposed Change | Why It's Necessary |
|---------|-----------------|-----------------|-------------------|
| M1 | FAQ questions are `<div>` elements with click-only interaction | Convert to `<button>` or add `tabindex`/`role`/`aria-expanded`/keydown | WCAG 2.1 AA compliance; keyboard users currently locked out |
| L2 | Footer shows `<a>ICU Media Design</a>` (no href) | Change to `<span>` or add href | Semantic correctness; screen reader announces broken link |
| L3 | Overlay card titles are `<h2>` | Change to `<h3>` | Heading hierarchy fix |

**These require explicit user approval before proceeding.**

---

## Statistics

- **Total findings:** 15
- **Critical:** 0 | **High:** 0 | **Medium:** 4 | **Low:** 11
- **By category:** Accessibility: 4 | Bug: 2 | Edge Case: 1 | Defensive: 4 | Configuration: 3 | Performance: 1
- **Resolved since previous report:** 8 (M1–M7 + CSP bonus)
- **Recurring from previous report:** 2 (L8 Formspree placeholder, L9 jQuery overhead)
- **New findings:** 13

---

## Audit Process Notes

### What Was Checked
Full re-audit: verified all 8 Medium/bonus fixes from pass 2, re-read all modified files (styles.css, script.js, server.js, all 10 HTML files, serve.mjs), checked for regressions, ran new checks on accessibility, keyboard navigation, ARIA attributes, heading hierarchy, event listener management, race conditions, null safety, and deployment configuration.

### Stack-Specific Checks Applied
- Verified CSP directives are correct and complete for current site functionality
- Verified z-index layer system is consistent across CSS and JS
- Verified button element semantics and CSS reset
- Checked for duplicate HTML attributes
- Checked keyboard accessibility on interactive elements
- Verified event listener cleanup patterns

### Areas Not Fully Covered
- Runtime testing of CSP in browser (static analysis only)
- Cross-browser visual regression testing
- Production App Engine deployment verification
- Formspree integration (placeholder ID)

### Time and Approach
Three parallel audit agents: server-side (server.js, serve.mjs, package.json, app.yaml), client JS (script.js full audit), and CSS/HTML (styles.css verification + HTML semantics). Focused on verifying fixes first, then discovering new issues.

---

## Recommended Next Steps

1. **Replace Formspree placeholder ID** (L8) — manual user action, recurring from pass 2
2. Fix the 4 Medium findings (FAQ accessibility, duplicate classes, overlay listeners, nav race condition)
3. Address Low findings as desired — accessibility items (L1–L3) are highest priority among them
4. Move `puppeteer` to devDependencies (L10) — reduces deployment size significantly
5. Run `/harden` again after fixes to confirm clean bill of health
