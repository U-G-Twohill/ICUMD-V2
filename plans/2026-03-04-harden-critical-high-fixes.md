# Plan: Fix Critical and High Findings from Harden Report

**Created:** 2026-03-04
**Status:** Implemented
**Request:** Fix all Critical (C1–C3) and High (H1–H5) findings from the harden report dated 2026-03-04.

---

## Overview

### What This Plan Accomplishes

Addresses the 3 critical and 5 high-severity findings from the first hardening audit: path traversal in the dev server, open CORS and missing security headers on the Express server, unprotected Stripe endpoints, exposed error internals, the broken contact form, modal animation jank, and stale sessionStorage causing blank flashes.

### Why This Matters

These fixes are required before the site can go live. The security items (C1–C3, H1–H2) protect against real attacks. The UX items (H3, H5) prevent users from having a broken experience on the most important conversion page (contact). The performance fix (H4) eliminates visible jank.

---

## Current State

### Relevant Existing Structure

- `serve.mjs` — dev-only static file server (21 lines)
- `server.js` — Express + Stripe backend (107 lines)
- `js/script.js` — all client-side JS (749 lines)
- `styles.css` — all styles (~2577 lines)
- `app.yaml` — App Engine static hosting config
- `contact.html` — contact page with unhandled form
- 10 HTML files — all have `document.write()` in footer (prep for M5, not in scope but noted)
- `package.json` — dependencies: express, cors, dotenv, stripe, puppeteer

### Gaps or Problems Being Addressed

| Finding | Problem |
|---------|---------|
| C1 | `serve.mjs` serves any file on disk via path traversal (`../../.env`) |
| C2 | `server.js` uses `cors()` with no origin restriction — any website can create Stripe sessions |
| C3 | No security headers on either server (no CSP, X-Frame-Options, HSTS, etc.) |
| H1 | No rate limiting on Stripe POST endpoints |
| H2 | Stripe SDK `error.message` returned directly to client |
| H3 | Contact form submits to `action="#"`, silently fails, user gets no feedback |
| H4 | `.modalBox` animates `width`/`height` causing layout thrashing |
| H5 | Stale `isTransitioning` in sessionStorage causes blank page flash on return visits |

---

## Proposed Changes

### Summary of Changes

- **C1:** Add path resolution and root-boundary check to `serve.mjs`
- **C2:** Restrict CORS to specific allowed origins via env var
- **C3:** Add security headers to `server.js` (helmet) and `app.yaml` (http_headers)
- **H1:** Add `express-rate-limit` to Stripe endpoints
- **H2:** Return generic error messages to client, keep details server-side
- **H3:** Add client-side form handler with Formspree integration (no backend needed), with success/error feedback UI
- **H4:** Replace modal width/height animation with transform: scale + opacity
- **H5:** Add staleness timeout to sessionStorage transition flag cleanup

### New Files to Create

None.

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `serve.mjs` | Add `path.resolve()` + root boundary check |
| `server.js` | Restrict CORS, add helmet, add rate limiting, sanitize error responses, guard dev logs |
| `package.json` | Add `helmet` and `express-rate-limit` dependencies |
| `app.yaml` | Add `http_headers` for security headers on static assets |
| `js/script.js` | Add contact form handler with fetch to Formspree, add sessionStorage staleness cleanup, remove dead `scrollPosition`/`wasAffixed` writes |
| `styles.css` | Replace modal width/height animation with transform-based animation |
| `contact.html` | Update form action to Formspree endpoint, add feedback elements |
| `.env` | Add `ALLOWED_ORIGINS` and `FORMSPREE_ENDPOINT` placeholder vars |

### Files to Delete

None.

---

## Design Decisions

### Key Decisions Made

1. **Formspree for contact form (H3):** No backend form handler exists and building one adds complexity. Formspree is free for low volume, requires no server code, and the form already has proper `name` attributes. The user can swap to a custom backend later without changing the form structure.

2. **Helmet for security headers (C3):** Standard, well-maintained Express middleware. Adds CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy in one line. Better than manually setting each header.

3. **Transform-based modal animation (H4):** Replace `width: 0% → 100%` and `height: 0% → 100%` with `transform: scale(0) → scale(1)`. Transform is GPU-composited, doesn't trigger layout recalculation.

4. **2-second staleness timeout (H5):** If `isTransitioning` is still `true` 2 seconds after DOMContentLoaded, it's stale (a normal transition completes in ~500ms). Force-clear it and show content immediately.

5. **CORS via env var (C2):** `ALLOWED_ORIGINS` env var lets the user configure allowed origins per environment. Defaults to `https://icumediadesign.com` if not set.

### Alternatives Considered

- **Contact form: Custom Express endpoint** — Rejected because it adds server-side complexity for a simple contact form. Formspree can be replaced later.
- **Contact form: Netlify Forms** — Rejected because the site deploys to App Engine, not Netlify.
- **Security headers: Manual res.setHeader()** — Rejected in favour of helmet, which handles edge cases and stays updated.

### Open Questions

1. **Formspree account:** The user needs to create a free Formspree account and get an endpoint ID. The plan will use a placeholder `YOUR_FORMSPREE_ID` that must be replaced before the form works.

---

## Step-by-Step Tasks

### Step 1: Fix path traversal in dev server (C1)

Replace the naive `join('.',  req.url)` with a resolved, bounded path.

**Actions:**

- Import `resolve` from `path` (already importing `join` and `extname`)
- Add `fileURLToPath` / `dirname` to get `__dirname` equivalent in ESM
- Resolve the requested path against the project root
- Check that the resolved path starts with the project root — return 403 if not
- Strip query strings from `req.url` before path resolution

**File: `serve.mjs` — full rewrite (small file):**

```javascript
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname);
const PORT = 3000;
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = resolve(ROOT, urlPath === '/' ? 'index.html' : '.' + urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
}).listen(PORT, () => console.log(`Dev server at http://localhost:${PORT}`));
```

**Files affected:** `serve.mjs`

---

### Step 2: Install new dependencies (C3, H1)

**Actions:**

- Run `npm install helmet express-rate-limit`

**Files affected:** `package.json`, `package-lock.json`

---

### Step 3: Harden Express server (C2, C3, H1, H2, L2)

**Actions:**

- Add `helmet` import and `app.use(helmet(...))` with sensible defaults
- Replace `app.use(cors())` with origin-restricted CORS using `ALLOWED_ORIGINS` env var
- Add rate limiter middleware scoped to `/create-*` routes (10 requests per minute per IP)
- Replace `error.message` in all 3 catch blocks with a generic string; keep `console.error` for server logs
- Wrap the Stripe key log in a `NODE_ENV` check

**File: `server.js` — updated version:**

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Validate required environment variables
const requiredEnvVars = ['STRIPE_TEST_SECRET_KEY'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Check your .env file');
    process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Static site uses inline scripts (document.write in footer) — enable after M5 fix
}));

// CORS — restrict to allowed origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://icumediadesign.com').split(',').map(s => s.trim());
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (server-to-server, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
}));

// Rate limiting on checkout endpoints
const checkoutLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.static('public'));
app.use(express.json());

// Health check
app.get('/api-test', (req, res) => {
    res.json({ status: 'success', message: 'API is working' });
});

// One-time payment
app.post('/create-checkout-session', checkoutLimiter, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.TEST_ONE_TIME_PRICE_ID,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${BASE_URL}/success.html`,
            cancel_url: `${BASE_URL}/cancel.html`,
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
    }
});

// Subscription
app.post('/create-subscription', checkoutLimiter, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.TEST_SUBSCRIPTION_PRICE_ID,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${BASE_URL}/success.html`,
            cancel_url: `${BASE_URL}/cancel.html`,
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating subscription:', error.message);
        res.status(500).json({ error: 'Failed to create subscription. Please try again.' });
    }
});

// Test payment (50 cents NZD)
app.post('/create-0-dollar-session', checkoutLimiter, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'nzd',
                    product_data: {
                        name: 'Test Payment',
                        description: 'Testing payment processing',
                    },
                    unit_amount: 50,
                },
                quantity: 1,
            }],
            mode: 'payment',
            billing_address_collection: 'required',
            submit_type: 'pay',
            success_url: `${BASE_URL}/success.html`,
            cancel_url: `${BASE_URL}/cancel.html`,
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating test payment session:', error.message);
        res.status(500).json({ error: 'Failed to create payment session. Please try again.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log('Stripe key loaded:', process.env.STRIPE_TEST_SECRET_KEY ? 'Yes' : 'No');
        console.log('Available endpoints:');
        console.log('  GET  /api-test');
        console.log('  POST /create-checkout-session');
        console.log('  POST /create-subscription');
        console.log('  POST /create-0-dollar-session');
    }
});
```

**Files affected:** `server.js`

---

### Step 4: Add security headers to App Engine config (C3)

**Actions:**

- Add `http_headers` to each handler in `app.yaml` for X-Frame-Options, X-Content-Type-Options, Referrer-Policy

**File: `app.yaml` — updated:**

```yaml
runtime: php81  # Used as a static file server on App Engine (no PHP code required)

handlers:
# Serve static assets directly
- url: /(.*\.(gif|png|jpg|jpeg|webp|svg|ico|css|js|html|woff|woff2|ttf|eot))$
  static_files: \1
  upload: .*\.(gif|png|jpg|jpeg|webp|svg|ico|css|js|html|woff|woff2|ttf|eot)$
  http_headers:
    X-Frame-Options: SAMEORIGIN
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=()

# All other routes fall back to index.html
- url: /.*
  static_files: index.html
  upload: index.html
  http_headers:
    X-Frame-Options: SAMEORIGIN
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Note: HSTS is handled automatically by App Engine for `*.appspot.com` domains and custom domains with SSL. CSP is deferred until `document.write()` is replaced (finding M5).

**Files affected:** `app.yaml`

---

### Step 5: Add contact form handler (H3)

**Actions:**

- Update `contact.html` form to submit via JS fetch to Formspree
- Add a `<div id="form-feedback">` element below the form for success/error messages
- Add a form submit handler in `js/script.js` that:
  - Prevents default submission
  - Shows a "Sending..." state on the button
  - POSTs to Formspree endpoint
  - On success: hides the form, shows a thank-you message
  - On error: shows an error message, re-enables the button
- Style the feedback messages in `styles.css`

**Changes to `contact.html`:**

Replace:
```html
<form action="#" method="POST" class="form-group" data-integration="email">
```
With:
```html
<form id="contact-form" class="form-group" data-integration="email">
```

Add after closing `</form>` tag:
```html
<div id="form-feedback" class="form-feedback" style="display: none;"></div>
```

**Changes to `js/script.js`:**

Add `initContactForm()` call in the DOMContentLoaded handler, and add the function:

```javascript
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const feedback = document.getElementById('form-feedback');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        feedback.style.display = 'none';

        const formData = new FormData(form);

        try {
            const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
            });

            if (response.ok) {
                form.style.display = 'none';
                feedback.textContent = 'Thank you! Your message has been sent. We\'ll get back to you within 24 hours.';
                feedback.className = 'form-feedback form-feedback-success';
                feedback.style.display = 'block';
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            feedback.textContent = 'Something went wrong. Please try again or email us directly at hello@icumediadesign.com';
            feedback.className = 'form-feedback form-feedback-error';
            feedback.style.display = 'block';
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}
```

**Changes to `styles.css`:**

Add form feedback styles:

```css
.form-feedback {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 1rem;
  line-height: 1.5;
}

.form-feedback-success {
  background: rgba(40, 167, 69, 0.15);
  border: 1px solid rgba(40, 167, 69, 0.3);
  color: #5cb85c;
}

.form-feedback-error {
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #e74c3c;
}
```

**Files affected:** `contact.html`, `js/script.js`, `styles.css`

---

### Step 6: Fix modal animation (H4)

**Actions:**

Replace the width/height animation with transform-based scaling.

**CSS changes in `styles.css`:**

Replace the `.modalBox` block (lines 1355–1365):
```css
.modalBox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  background: rgba(0, 0, 0, 0.8);
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
```

Replace the `.modalBox-body` block (lines 1367–1377):
```css
.modalBox-body {
  width: 80%;
  max-width: 800px;
  height: 450px;
  overflow: hidden;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  border-radius: 0.5rem;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

Replace the `.modalBox.show` block (lines 1379–1385):
```css
.modalBox.show {
  opacity: 1;
  visibility: visible;
}
```

Replace the `.modalBox.show .modalBox-body` block (lines 1387–1391):
```css
.modalBox.show .modalBox-body {
  transform: translate(-50%, -50%) scale(1);
}
```

**Files affected:** `styles.css`

---

### Step 7: Fix stale sessionStorage transition flag (H5) and remove dead writes (L3)

**Actions:**

- Add a staleness guard to the IIFE at the top of `js/script.js` — if `isTransitioning` has been `true` for more than 2 seconds after page load, clear it
- Remove the two dead `sessionStorage.setItem` calls for `scrollPosition` and `wasAffixed`

**Changes to `js/script.js`:**

Replace the existing IIFE (lines 1–18) with:
```javascript
// Handle immediate page state before DOM loads to prevent flashing
(function() {
    if (sessionStorage.getItem('isTransitioning') === 'true') {
        document.documentElement.classList.add('transitioning');
        const style = document.createElement('style');
        style.textContent = `
            .transitioning .header,
            .transitioning .container,
            .transitioning .footer,
            .transitioning .contact-section,
            .transitioning .modalBox,
            .transitioning .theme-selector {
                opacity: 0 !important;
            }
        `;
        document.head.appendChild(style);

        // Failsafe: if page load takes too long or tab was closed mid-transition,
        // clear the flag and show content after 2 seconds
        setTimeout(function() {
            if (sessionStorage.getItem('isTransitioning') === 'true') {
                sessionStorage.removeItem('isTransitioning');
                sessionStorage.removeItem('transitionTarget');
                document.documentElement.classList.remove('transitioning');
                document.body.classList.add('page-fade-in');
                setTimeout(function() {
                    document.body.classList.remove('page-fade-in');
                }, 300);
            }
        }, 2000);
    }
})();
```

Remove lines 303–304 (the dead sessionStorage writes):
```javascript
// DELETE THESE:
sessionStorage.setItem('scrollPosition', window.scrollY);
sessionStorage.setItem('wasAffixed', window.scrollY > 100);
```

**Files affected:** `js/script.js`

---

### Step 8: Update .env with new variables

**Actions:**

- Add `ALLOWED_ORIGINS` placeholder
- Add `NODE_ENV` placeholder

**Append to `.env`:**
```
# CORS — comma-separated allowed origins (production domain)
ALLOWED_ORIGINS='http://localhost:3000'

# Environment
NODE_ENV='development'
```

**Files affected:** `.env`

---

### Step 9: Validate all changes

**Actions:**

- Start `serve.mjs` and test path traversal: `curl http://localhost:3000/../../.env` should return 403
- Start `server.js` and verify it starts without errors
- Verify CORS by checking response headers on `/api-test`
- Open `contact.html` in browser, submit form, verify feedback shows
- Open a page with modal, verify animation is smooth
- Test page transition, close tab mid-transition, reopen — verify no blank flash
- Verify App Engine config syntax: `gcloud app deploy --dry-run` (if gcloud installed)

**Files affected:** None (testing only)

---

## Connections & Dependencies

### Files That Reference This Area

- All 10 HTML pages include `js/script.js` and `styles.css` — changes propagate automatically
- `contact.html` is the only page with a form
- `app.yaml` only affects App Engine deployment
- `server.js` is the backend entry point
- `serve.mjs` is dev-only

### Updates Needed for Consistency

- `CLAUDE.md` does not need updating — no structural changes
- `context/current-data.md` — after implementation, update "Stripe integration" row from "Broken" to "Hardened (test mode)" and "Form handling" from "Not implemented" to "Formspree integration"
- `outputs/harden-knowledge.md` — update Fix Effectiveness Tracker after verification

### Impact on Existing Workflows

- **CORS restriction** means local development needs `ALLOWED_ORIGINS=http://localhost:3000` in `.env` — already added in Step 8
- **Formspree** requires a free account setup (one-time, manual)
- **Rate limiting** may affect rapid testing of Stripe endpoints — 10/min is generous enough for dev

---

## Validation Checklist

- [ ] `serve.mjs` rejects path traversal requests with 403
- [ ] `server.js` starts cleanly with `npm start`
- [ ] Security headers present in Express responses (check with browser devtools)
- [ ] CORS blocks requests from unauthorized origins
- [ ] Rate limiter returns 429 after 10 rapid requests to checkout endpoints
- [ ] Stripe error responses show generic messages, not SDK internals
- [ ] Contact form shows "Sending..." state, then success or error message
- [ ] Modal opens/closes smoothly with no layout jank
- [ ] Stale `isTransitioning` flag is cleared after 2 seconds
- [ ] `scrollPosition` and `wasAffixed` are no longer written to sessionStorage
- [ ] `app.yaml` includes security headers on both handler blocks
- [ ] No regressions in page transitions, scroll behaviour, navbar, or expanding cards

---

## Success Criteria

The implementation is complete when:

1. All 3 Critical findings (C1–C3) are resolved and verifiable
2. All 5 High findings (H1–H5) are resolved and verifiable
3. The site functions identically to before for all user-facing features (no regressions)
4. `context/current-data.md` is updated to reflect new form and Stripe status

---

## Notes

- **Formspree ID is a placeholder** — user must sign up at formspree.io and replace `YOUR_FORMSPREE_ID` with their actual form endpoint
- **CSP header is deferred** — `document.write()` in all 10 footers (finding M5) would break under CSP. CSP should be enabled after M5 is fixed in a separate plan.
- **Medium findings not in scope** — `transition: all` replacement (M1), `will-change` cleanup (M2), z-index normalization (M4), `document.write` replacement (M5), accessibility fixes (M6) are deferred to the next plan.
- The `helmet` `contentSecurityPolicy` option is set to `false` specifically because of the `document.write()` usage. Once those are replaced, re-enable CSP.

---

## Implementation Notes

**Implemented:** 2026-03-04

### Summary

All 9 steps executed in order. Path traversal fixed in serve.mjs, Express server hardened with helmet + CORS + rate limiting + generic errors, App Engine config updated with security headers, contact form wired to Formspree with feedback UI, modal animation switched to transform-based, sessionStorage staleness failsafe added, dead writes removed, .env updated, context/current-data.md updated.

### Deviations from Plan

None — all steps executed as specified.

### Issues Encountered

- npm audit reports 4 vulnerabilities in existing dependencies (1 low, 1 moderate, 2 high) — these are pre-existing in puppeteer/express deps, not introduced by this plan. Consider running `npm audit fix` separately.
