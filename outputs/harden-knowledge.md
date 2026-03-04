# Hardening Knowledge Base

> Cumulative learnings from all hardening audits of this project. Read by `/harden` at the start of every run to improve efficiency and coverage.

---

## Project-Specific Patterns

### Known Vulnerability Patterns
- **Dev server path traversal** — FIXED. `serve.mjs` now uses `resolve()` + `startsWith(ROOT)`. Any new dev server must follow this pattern.
- **Open CORS** — FIXED. `server.js` uses `ALLOWED_ORIGINS` env var. Any new Express routes must go through the same CORS middleware.
- **Error message passthrough** — FIXED. All Stripe catch blocks now return generic messages. Maintain this pattern for any new API endpoints.

### Architecture Weak Points
- **CSP enabled with `unsafe-inline` for styles** — `document.write()` removed, CSP active. `style-src 'unsafe-inline'` needed because expanding cards and page transitions set inline styles via JS.
- **Formspree ID is a placeholder** — contact form handler works but points to `YOUR_FORMSPREE_ID`. Will fail on every submission until replaced.
- **`transition: all` convention** — all 13 instances replaced with specific properties. New CSS should always use specific property transitions.

### Stack-Specific Gotchas
- **`document.write()` in footers** — FIXED. Replaced with `<span class="copyright-year">` + JS `textContent` init.
- **`transition: all` epidemic** — FIXED. All 13 instances replaced with specific property transitions.
- **jQuery loaded but barely used** — 3 calls (~87KB overhead). Separate removal effort needed.
- **`will-change` on one-shot animations** — FIXED. Removed from `.reveal*` classes.
- **Z-index collision at 1001** — FIXED. Normalized to 0–600 layer system.

---

## Audit History

| Date | Focus | Findings | Critical | High | Medium | Low | Key Insight |
|------|-------|----------|----------|------|--------|-----|-------------|
| 2026-03-04 | Full | 20 | 3 | 5 | 7 | 5 | Security headers and CORS are the biggest gaps; CSS performance has systemic `transition: all` issue |
| 2026-03-04 (pass 2) | Full | 13 | 0 | 0 | 8 | 5 | All C/H fixed and verified. Remaining items are CSS performance, accessibility, and deprecated patterns. CSP blocked by document.write. |
| 2026-03-04 (pass 3) | Full | 15 | 0 | 0 | 4 | 11 | All M1–M7 fixed and verified. New findings: FAQ keyboard accessibility, duplicate class attrs, event listener leaks, defensive coding gaps. |
| 2026-03-04 (pass 4) | Full | 11 | 0 | 0 | 3 | 8 | All pass 3 fixes verified. CSP too restrictive — blocks Google Fonts and inline transition script. Cross-reference CSP directives against actual resource imports. |

---

## Lessons Learned

### What Worked Well
- Reading server files first (highest risk surface) before moving to client-side
- Pattern-based grep for `transition: all`, `document.write`, `innerHTML` across the codebase
- Checking `.gitignore` early to verify `.env` exclusion
- Verification pass: reading each modified file and confirming the fix matches the plan spec was efficient and caught no regressions

### Common False Positives
- `innerHTML`/`eval`/`Function()` matches in vendor jQuery/Bootstrap files — these are third-party library internals, not custom code vulnerabilities
- `target="_blank"` — not used anywhere in the project, so no `rel="noopener"` issue exists

### Missed on First Pass
- **Duplicate `class` attributes** — 6 elements in services.html and solutions.html have two `class` attributes (second silently ignored). Missed in passes 1-2.
- **FAQ keyboard accessibility** — 37 `.inline-faq-question` divs with click-only handlers. No tabindex, role, or keyboard events. Caught in pass 3.
- **Event listener accumulation** — ExpandingCard overlay listeners multiply per instance. Caught in pass 3.
- **Parallel audit agents** — running server, JS, and HTML/CSS audits in parallel was effective at catching different categories of issues
- **CSP cross-referencing** — cross-referencing CSP directives against actual `@import`, `<script>`, `fetch()`, and font references in HTML/CSS caught 2 blocking issues missed when CSP was first configured. Always validate CSP against real resource usage, not just the code that generates the headers.

---

## Custom Checklist Additions

Items to check on future audits that aren't in the standard checklist but are relevant to this project:

- [x] Check if contact form handler has been implemented and has proper validation — YES, Formspree handler with error handling
- [ ] Check if Formspree placeholder ID has been replaced with real ID
- [ ] Check if Stripe webhook endpoint has been added and validates signatures
- [x] Verify `document.write()` has been replaced before CSP headers are added — YES, replaced with span + JS
- [x] Check for new `transition: all` instances in CSS — all 13 replaced
- [x] Verify sessionStorage cleanup for page transition flags — YES, 2s failsafe added
- [ ] Check if jQuery has been removed and replaced with vanilla JS
- [x] Verify CORS is restricted to production domain before deployment — YES, env-var based
- [x] Verify `contentSecurityPolicy` is re-enabled in helmet after document.write removal — YES, CSP directives configured
- [ ] Check that `ALLOWED_ORIGINS` env var is updated for production domain before deploy
- [ ] Check all interactive `<div>` elements have keyboard accessibility (tabindex, role, aria-expanded, keydown)
- [ ] Check for duplicate `class` attributes in HTML (second is silently ignored)
- [ ] Check event listener cleanup — listeners on shared elements should use delegation, not per-instance
- [ ] Verify `puppeteer` is in devDependencies, not production
- [ ] Cross-reference CSP directives against actual resource imports (@import, inline scripts, fetch targets, font sources)

---

## Fix Effectiveness Tracker

| Finding | Fix Applied | Date Fixed | Verified Fixed? | Regression? | Notes |
|---------|------------ |------------|-----------------|-------------|-------|
| C1 Path traversal | `resolve()` + `startsWith(ROOT)` | 2026-03-04 | Yes | No | serve.mjs:19 |
| C2 Open CORS | Origin-restricted via env var | 2026-03-04 | Yes | No | server.js:28-39 |
| C3 No security headers | helmet + app.yaml http_headers | 2026-03-04 | Yes | No | CSP now enabled with directives |
| H1 No rate limiting | express-rate-limit 10/min | 2026-03-04 | Yes | No | Applied to all 3 checkout routes |
| H2 Error exposure | Generic error messages | 2026-03-04 | Yes | No | 3 catch blocks sanitized |
| H3 Silent form failure | Formspree + feedback UI | 2026-03-04 | Yes | No | Placeholder ID needs replacement |
| H4 Modal layout animation | transform: scale() | 2026-03-04 | Yes | No | styles.css modal block rewritten |
| H5 Stale sessionStorage | 2s failsafe timeout | 2026-03-04 | Yes | No | IIFE at top of script.js |
| L2 Dev log leak | NODE_ENV guard | 2026-03-04 | Yes | No | server.js:129 |
| L3 Dead sessionStorage writes | Removed | 2026-03-04 | Yes | No | No matches in grep |
| M1/M3 transition: all | Specific property transitions | 2026-03-04 | Yes | No | 13 instances → 0 |
| M2 will-change on reveals | Removed from .reveal* CSS | 2026-03-04 | Yes | No | Only infinite anims retain will-change |
| M4 Z-index collision | Normalized to 0–600 layers | 2026-03-04 | Yes | No | CSS + JS updated |
| M5 document.write | span.copyright-year + JS init | 2026-03-04 | Yes | No | 10 footers updated |
| M6 javascript:void(0) | Converted to button elements | 2026-03-04 | Yes | No | 6 triggers in design.html |
| M7 Scroll timeout | scrollend event + 1s fallback | 2026-03-04 | Yes | No | script.js handlePageTransition |
| Bonus: CSP | helmet CSP directives enabled | 2026-03-04 | Yes (static) | No | Directives verified correct for current site; runtime test still needed |
| P3-M1 FAQ accessibility | Converted divs to buttons + aria-expanded | 2026-03-04 | Yes | No | 37 questions across 3 files |
| P3-M2 Duplicate class attrs | Merged into single class attribute | 2026-03-04 | Yes | No | 6 elements in services/solutions |
| P3-M3 Overlay listener leak | Delegated to single init-block listener | 2026-03-04 | Yes | No | Removed per-instance listeners |
| P3-M4 Nav double-click race | isNavigating guard added | 2026-03-04 | Yes | No | Module-level flag in handlePageTransition |
| P4-M1 CSP blocks fonts | Added fonts.googleapis.com + fonts.gstatic.com to CSP | 2026-03-04 | Yes | No | server.js styleSrc + fontSrc |
| P4-M2 CSP blocks inline script | Added SHA-256 hash to scriptSrc | 2026-03-04 | Yes | No | Hash of transition check script |
| P4-M3 serve.mjs URI crash | try/catch around decodeURIComponent | 2026-03-04 | Yes | No | Returns 400 on malformed URLs |
| P4-L1 isNavigating not reset | Added reset before same-page return | 2026-03-04 | Yes | No | js/script.js handlePageTransition |
| P4-L2 closeBtn null check | Added null guard | 2026-03-04 | Yes | No | js/script.js escape handler |
| L-puppeteer | Moved to devDependencies | 2026-03-04 | Yes | No | package.json |
| L-HSTS | Added Strict-Transport-Security header | 2026-03-04 | Yes | No | Both app.yaml handlers |
| L-footer-anchor | Changed `<a>` to `<span>` | 2026-03-04 | Yes | No | All 10 HTML footers |
| L-heading-hierarchy | Overlay card h2 → h3 | 2026-03-04 | Yes | No | 9 instances in solutions.html |
