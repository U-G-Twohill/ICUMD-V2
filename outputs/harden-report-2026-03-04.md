# Harden Report: ICU Media Design Website

**Date:** 2026-03-04
**Focus:** Full
**Iteration:** 1st audit
**Previous reports:** None — first audit

---

## Executive Summary

The site is a well-structured static multi-page business website with a minimal Express+Stripe backend. The main risks are: a **path traversal vulnerability in the dev server**, **wide-open CORS on the Stripe server**, **no security headers** on either server, and an **unimplemented contact form** that silently fails on submission. Performance-wise, there are 15 instances of `transition: all` and modal animations using layout properties (width/height) instead of transforms. None of these are catastrophic for a pre-launch site, but the security items should be addressed before going live.

## Project Profile

- **Type:** Static multi-page business website with Express API backend
- **Stack:** HTML, CSS (custom + Bootstrap 4.3.1), vanilla JS, jQuery 3.4.1, Express 4, Stripe SDK, deployed via Google Cloud App Engine (static mode)
- **Key flows audited:** Page navigation/transitions, contact form, Stripe checkout endpoints, dev server file serving, expanding cards, scroll reveal, mobile menu

---

## Findings

### Critical (must fix before production)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| C1 | Security | **Path traversal in dev server** — `serve.mjs` joins `req.url` directly to filesystem path with no sanitization. A request like `GET /../../.env` would serve any file on disk. | `serve.mjs:14` | Full filesystem read access to attacker on local network | Resolve the path, then verify it's within the project root before serving. Use `path.resolve()` and check `filePath.startsWith(projectRoot)`. |
| C2 | Security | **No CORS restriction on Stripe endpoints** — `app.use(cors())` allows any origin to call `/create-checkout-session`, `/create-subscription`, `/create-0-dollar-session`. | `server.js:23` | Any website can create Stripe checkout sessions using your account, potential for abuse and cost. | Restrict to `origin: ['https://icumediadesign.com']` with explicit methods. |
| C3 | Security | **No security headers** — neither server sets CSP, X-Frame-Options, X-Content-Type-Options, HSTS, or Referrer-Policy. | `server.js`, `serve.mjs` | Clickjacking, MIME sniffing, missing HTTPS enforcement. App Engine's `app.yaml` also has no header config. | Add `helmet` middleware to Express. For App Engine static serving, add `http_headers` in `app.yaml`. |

### High (should fix soon)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| H1 | Security | **No rate limiting on Stripe endpoints** — all three POST endpoints can be called unlimited times with no throttling. | `server.js:31-97` | Attacker can spam Stripe API calls, potentially hitting rate limits or creating excessive checkout sessions. | Add `express-rate-limit` middleware (e.g., 10 req/min per IP on checkout endpoints). |
| H2 | Security | **Stripe error messages exposed to client** — `error.message` from Stripe SDK is returned directly in JSON response. | `server.js:45,65,95` | Internal error details (API version, key format hints, Stripe internal messages) leak to client. | Return generic error message to client; log details server-side only. |
| H3 | Bug | **Contact form silently fails** — form has `action="#" method="POST"` and `data-integration="email"` but no handler exists. Submitting reloads the page with no feedback. | `contact.html:126` | Users think they've contacted you but the message goes nowhere. This is the most user-facing bug on the site. | Either wire up a backend endpoint or use a third-party form service (Formspree, Netlify Forms, etc.) and add client-side success/error feedback. |
| H4 | Performance | **Modal animates width/height** — `.modalBox` and `.modalBox-body` transition from `width:0%; height:0%` to full size, causing layout recalculation every frame. | `styles.css:1357-1384` | Jank/stutter during modal open/close, especially on mobile. | Use `transform: scale(0)` → `scale(1)` with `opacity` instead of animating dimensions. |
| H5 | Bug | **sessionStorage items never cleaned on direct navigation** — if a user closes the tab during a page transition, `isTransitioning` stays `true` in sessionStorage, causing the next visit to briefly show a blank page before content fades in. | `js/script.js:3-17,500-501` | Flash of invisible content on return visits within the same browser session. | Add a timeout or cleanup: if `isTransitioning` is still `true` after 2 seconds on page load, force-clear it. |

### Medium (fix when able)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| M1 | Performance | **15 instances of `transition: all`** — transitions every CSS property on state change, including properties that don't need animating (padding, margin, z-index, etc.). | `styles.css:36,348,380,549,810,892,959,1064,1075,1303,1313,1333,1364,1370,2199` | Unnecessary compositing work; cumulative performance cost across interactions. | Replace each with specific properties: `transition: opacity 0.3s ease, transform 0.3s ease` or `background-color`, `border-color`, etc. as needed. |
| M2 | Performance | **`will-change` on one-shot scroll reveals** — `.reveal`, `.reveal-left`, `.reveal-right` all set `will-change: opacity, transform` permanently, but they only animate once then sit idle. | `styles.css:~2390-2404` | GPU memory held for every revealed section for the page lifetime. On pages with many sections, this adds up. | Remove `will-change` from CSS. If needed, add it via JS just before animation and remove after `revealed` class is applied. |
| M3 | Performance | **Overlay card hover uses `transition: all` on 3 nested elements** — `.overlay-img .overlay`, `.des`, and `.des p` all have `transition: all 0.5s`. | `styles.css:1300-1333` | Triple-layer repainting on every hover. | Target specific properties only. |
| M4 | Bug | **Z-index collision** — both `.expanding-card.is-expanded` and `.page-navbar.affix` use `z-index: 1001`. | `styles.css:502,595` | If an expanded card is open while scrolled, navbar and card compete for the same stacking layer. Card overlay at `z-index: 999` could slip behind navbar. | Use distinct layers: navbar `100`, dropdown `200`, card overlay `300`, expanded card `400`. |
| M5 | Edge Case | **`document.write()` in footer on all 10 pages** — used for dynamic copyright year. While harmless in current usage, `document.write()` is deprecated behavior and blocked by some CSP policies. | All HTML files (footer) | Will break if you add a `Content-Security-Policy` header (which you should — see C3). | Replace with a JS snippet that uses `textContent` on a `<span>` element, or just hardcode the year. |
| M6 | Accessibility | **`javascript:void(0)` links used as buttons** — 6 expanding card triggers use `<a href="javascript:void(0)">` instead of `<button>`. | `design.html:208,238,268,298,350,403` | Screen readers announce these as links with no destination. Keyboard users may not get proper focus behavior. | Replace with `<button type="button" class="expanding-card-trigger">`. |
| M7 | Edge Case | **Page transition scroll-to-top timeout is hardcoded 800ms** — if smooth scroll takes longer (long pages, slow devices), the fade begins before scroll completes, causing a visual jump. | `js/script.js:479` | On long pages or slow devices, page appears to jump during transition. | Use `scrollend` event (with fallback) instead of a fixed timeout. |

### Low (nice to have)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| L1 | Performance | **Broad `*` selector during transitions** — `.transitioning .page-navbar *` applies `opacity: 1 !important` to every navbar child. | `styles.css:39-42` | Minor paint cost during page transitions. | Target specific elements instead of `*`. |
| L2 | Security | **Startup log confirms Stripe key presence** — `console.log('Stripe key loaded:', ... ? 'Yes' : 'No')` | `server.js:101` | Minor info leak in shared logs/hosting dashboards. | Guard with `NODE_ENV === 'development'` check. |
| L3 | Bug | **`scrollPosition` and `wasAffixed` stored in sessionStorage but never read** — these values are set on every scroll event but no code ever retrieves them. | `js/script.js:303-304` | Dead code; minor sessionStorage write overhead on every scroll. | Remove these two `setItem` calls. |
| L4 | Edge Case | **No `maxlength` on contact form textarea** — users can submit extremely long messages if the form is eventually wired up. | `contact.html:132` | Potential for oversized payloads when backend is implemented. | Add `maxlength="5000"` or similar. |
| L5 | SEO | **LocalBusiness schema missing `telephone`** — Google recommends telephone for local business rich results. | `index.html:25-41` | Reduced chance of rich snippet display. | Add telephone field when ready to publish a contact number. |
| L6 | Performance | **jQuery 3.4.1 loaded on all pages** — only used for modal toggle and search toggle (3 lines of code). | All HTML files | ~87KB loaded for 3 jQuery calls that could be vanilla JS. | Replace jQuery calls with vanilla JS equivalents and remove jQuery. |
| L7 | Validation | **No `novalidate` consideration** — form relies on HTML5 validation only. No custom validation feedback UI. | `contact.html:126-134` | Default browser validation bubbles look different across browsers, may not match site design. | Add custom validation UI when implementing the form handler. |

---

## Functionality Impact Assessment

**The following fixes would alter existing behavior:**

| Finding | Current Behavior | Proposed Change | Why It's Necessary |
|---------|-----------------|-----------------|-------------------|
| H3 | Contact form submits to `#`, page reloads silently | Wire to a backend endpoint with success/error feedback | Users currently get zero confirmation — they may think the site is broken |
| M5 | `document.write()` renders copyright year | Replace with `textContent` on a `<span>` | Will break under CSP headers; `document.write()` is deprecated |
| M6 | Card triggers are `<a href="javascript:void(0)">` | Replace with `<button>` elements | Changes element type; may need CSS adjustments for button reset |
| H5 | Page fades in after transition; stale flag causes blank flash | Add cleanup timeout for stale `isTransitioning` | Changes load behavior — content appears immediately if flag is stale |
| L6 | jQuery handles modal/search toggle | Replace with vanilla JS | Removes jQuery dependency entirely |

**These require explicit user approval before proceeding.**

---

## Statistics

- **Total findings:** 20
- **Critical:** 3 | **High:** 5 | **Medium:** 7 | **Low:** 7 (includes 2 combined)
- **By category:** Security: 6 | Bugs: 4 | Edge Cases: 3 | Performance: 5 | Validation: 1 | Accessibility: 1
- **Recurring from previous report:** N/A (first audit)

---

## Audit Process Notes

### What Was Checked
All 6 phases run (security, bugs, edge cases, performance, validation, plus full HTML/CSS/JS audit). All 10 HTML pages, `styles.css`, `js/script.js`, `server.js`, `serve.mjs`, `app.yaml`, `package.json`, `.env`, and `.gitignore` were read and analyzed.

### Stack-Specific Checks Applied
- **Express/Node:** CORS, middleware order, env var handling, error responses, rate limiting
- **Stripe:** Checkout session creation security, error exposure, webhook handling (missing)
- **Static HTML/CSS/JS:** XSS vectors, CSP compatibility, `document.write()`, inline scripts, form handling, sessionStorage usage
- **CSS animations:** Layout property animation, `transition: all`, `will-change` lifecycle, z-index stacking, backdrop-filter usage
- **App Engine:** `app.yaml` handler config, security header options

### Areas Not Fully Covered
- **SCSS source files** — audited compiled CSS only; SCSS may have additional patterns
- **Production deployment config** — no access to live App Engine settings or Stripe dashboard
- **Stripe webhook handling** — not implemented yet, so nothing to audit
- **Email/form service integration** — not implemented
- **Cross-browser testing** — audit is code-based, not runtime-tested

### Time and Approach
Read project context and memory first, then audited server-side code (highest risk), client-side JS, HTML structure across all pages, and CSS performance. Used grep/glob for pattern-based detection of common issues.

---

## Recommended Next Steps

1. Review Critical and High findings
2. Approve or reject any behavior-altering fixes in the Functionality Impact Assessment
3. Run: `/create-plan fix critical and high findings from harden report 2026-03-04`
4. Run: `/implement plans/[resulting-plan].md`
5. Re-run: `/harden` to verify fixes and find remaining issues
