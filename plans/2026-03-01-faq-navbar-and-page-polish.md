# Plan: Add FAQ to Navbar & Polish FAQ Page

**Created:** 2026-03-01
**Status:** Draft
**Request:** Add FAQ link to navbar on all pages and improve FAQ page visual presentation

---

## Overview

### What This Plan Accomplishes

Adds an "FAQ" nav link between Portfolio and Contact Us on all 10 HTML pages, updates the active-nav JS mapping, and polishes the FAQ page layout — replacing the quick-nav button bar with a cleaner sticky sidebar or anchor-scroll approach, and tightening up section spacing/styling for visual consistency with the rest of the site.

### Why This Matters

The FAQ page has 29 well-written Q&As across 6 sections but is currently unreachable from navigation. Making it accessible from the navbar improves UX and SEO (internal linking). Visual polish brings it in line with the V2 design overhaul applied to all other pages.

---

## Current State

### What Already Works

- `faq.html` already uses the `.inline-faq` accordion pattern (same as design.html and solutions.html)
- 6 sections with 29 Q&As, all with click-to-expand
- JSON-LD FAQPage structured data in place
- Full SEO meta tags (OG, Twitter, canonical)
- Shader background configured
- Ambient blobs configured

### Issues to Fix

1. **No navbar link** — FAQ is not accessible from any page's navigation
2. **Active nav mapping** — `faq.html` maps to `null` in `setActiveNavLink()` (line 613 of script.js)
3. **Quick-nav buttons** — the `btn-theme-color` button bar at the top feels dated and takes up space; could be replaced with a cleaner approach
4. **Section spacing** — `mb-5` between sections is standard but the page lacks the visual rhythm of other pages (no alternating reveal directions, no section icons integrated into the flow)
5. **Quick-nav UX** — clicking a quick-nav anchor should smooth-scroll with offset (already handled by `initSmoothScrollWithOffset()`)

---

## Proposed Changes

### Summary

- Add `<li class="nav-item"><a href="faq.html" class="nav-link">FAQ</a></li>` between Portfolio and Contact Us on all 10 pages
- Update `setActiveNavLink()` to map `faq.html` → `'FAQ'`
- Replace the quick-nav button bar with a compact pill/tag nav row that matches site styling
- Remove `mb-5` from sections, use consistent spacing pattern
- Add `reveal` direction variety (left/right) to FAQ sections for visual interest
- Ensure the "Contact" quick-nav link simply points to the CTA section at bottom (already does)

### Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Add FAQ nav item |
| `about.html` | Add FAQ nav item |
| `services.html` | Add FAQ nav item |
| `design.html` | Add FAQ nav item |
| `solutions.html` | Add FAQ nav item |
| `faq.html` | Add FAQ nav item + polish page layout |
| `contact.html` | Add FAQ nav item |
| `portfolio.html` | Add FAQ nav item |
| `work.html` | Add FAQ nav item |
| `blog.html` | Add FAQ nav item |
| `js/script.js` | Update `setActiveNavLink()` mapping |

### No New Files

All changes are edits to existing files.

---

## Step-by-Step Tasks

### Step 1: Add FAQ Nav Item to All 10 Pages

On every page, insert the FAQ nav item between the Portfolio `<li>` and the Contact Us `<li>`.

**Before (all pages):**
```html
<li class="nav-item"><a href="portfolio.html" class="nav-link">Portfolio</a></li>

<li class="nav-item"><a href="contact.html" class="nav-link">Contact Us</a></li>
```

**After:**
```html
<li class="nav-item"><a href="portfolio.html" class="nav-link">Portfolio</a></li>
<li class="nav-item"><a href="faq.html" class="nav-link">FAQ</a></li>
<li class="nav-item"><a href="contact.html" class="nav-link">Contact Us</a></li>
```

**Files:** all 10 HTML files

### Step 2: Update Active Nav Link Mapping

In `js/script.js`, change the `faq.html` mapping from `null` to `'FAQ'`.

**Before:**
```js
'faq.html': null
```

**After:**
```js
'faq.html': 'FAQ'
```

**File:** `js/script.js`

### Step 3: Polish FAQ Page Quick-Nav

Replace the `btn-theme-color` button bar with a more compact, modern pill nav using existing `.btn-primary` outline styling or a simple inline link row. Remove the `Contact` quick-nav item (redundant — the CTA section is visible at the bottom).

**Before:**
```html
<nav aria-label="FAQ Sections" class="mb-5">
    <ul class="nav flex-column flex-md-row justify-content-center gap-3">
        <li><a href="#getting-started" class="btn btn-theme-color">Getting Started</a></li>
        ...7 items...
    </ul>
</nav>
```

**After:** Wrap in a `lighter-section` with heading, use smaller outline-style pills, remove Contact item:
```html
<div class="lighter-section reveal text-center">
    <h2 class="title mb-4">Browse by Topic</h2>
    <div class="heading-divider"></div>
    <div class="faq-nav-pills">
        <a href="#getting-started" class="faq-pill">Getting Started</a>
        <a href="#design" class="faq-pill">Web Design</a>
        <a href="#solutions" class="faq-pill">Solutions</a>
        <a href="#pricing" class="faq-pill">Pricing</a>
        <a href="#hosting" class="faq-pill">Hosting & Support</a>
        <a href="#working-with-us" class="faq-pill">Working With Us</a>
    </div>
</div>
```

**File:** `faq.html`

### Step 4: Add FAQ Pill CSS

Add minimal CSS for the pill nav:

```css
.faq-nav-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.faq-pill {
  padding: 0.5rem 1.25rem;
  border: 1px solid rgba(0, 123, 255, 0.3);
  border-radius: 2rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.faq-pill:hover {
  background: rgba(0, 123, 255, 0.15);
  border-color: #007bff;
  color: #fff;
}
```

**File:** `styles.css`

### Step 5: Clean Up Section Spacing & Reveal Directions

- Remove `mb-5` from FAQ sections (the sections' own padding handles spacing)
- Add alternating reveal directions for visual interest:
  - Getting Started: `reveal`
  - Web Design: `reveal`
  - Solutions: `reveal-left`
  - Pricing: `reveal`
  - Hosting: `reveal-right`
  - Working With Us: `reveal`
  - CTA: `reveal`

**File:** `faq.html`

---

## Validation Checklist

- [ ] FAQ link appears in navbar on all 10 pages, between Portfolio and Contact Us
- [ ] FAQ link highlights as active when on faq.html
- [ ] Quick-nav pills scroll smoothly to correct sections
- [ ] All 29 Q&As still expand/collapse correctly
- [ ] Section reveal animations fire on scroll
- [ ] Mobile hamburger menu shows FAQ link
- [ ] Shader background still renders on FAQ page
- [ ] Page looks visually consistent with rest of site

---

## Success Criteria

1. FAQ is accessible from the navbar on every page
2. FAQ page visual presentation matches the quality of other V2 pages
3. All existing functionality (accordion, SEO, shader) preserved
