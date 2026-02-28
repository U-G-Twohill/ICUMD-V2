# Plan: Website Launch Readiness — Structure, FAQ, and SEO

**Created:** 2026-02-28
**Status:** Implemented
**Request:** Implement full website launch readiness scope — restructure services hub, add cross-linking between service pages, rework FAQ with hybrid approach, improve SEO across all pages, refine solutions page, and remove blog from navigation.

---

## Overview

### What This Plan Accomplishes

Transforms the ICU Media Design website from a collection of individually solid pages into a cohesive, SEO-optimized, launch-ready site with clear client pathways. The Design → Solutions upsell flow becomes visible, the FAQ serves both general and service-specific needs, and every page has proper meta tags, structured data, and heading hierarchy.

### Why This Matters

The site's content is largely complete but the pages don't guide visitors through a journey. A non-technical NZ small business owner landing on any page should understand what ICU offers within 10 seconds and have a clear path to the next step. This work bridges the gap between "pages exist" and "the site converts."

---

## Current State

### Relevant Existing Structure

| File | Current State |
|------|---------------|
| `services.html` | Thin pass-through with two cards and generic CTA |
| `design.html` | Strong — 6 expanding cards, clear pricing, 3 sections (Design/Maintenance/Additional Features) |
| `solutions.html` | Good structure but copy-paste error in subtitle, no pricing signals, no cross-link to design |
| `faq.html` | 25 questions in 9 sections — no solutions-specific questions, no JSON-LD schema |
| `index.html` | H1 is an image (banner), no structured data, no Open Graph tags |
| `about.html` | Good content, missing structured data and OG tags |
| `contact.html` | Minimal page, missing structured data and OG tags |
| `blog.html` | "Coming Soon" — still in navigation |
| `portfolio.html` | "Coming Soon" — stays in navigation |
| `work.html` | Links to portfolio and blog, blog link needs addressing |
| `styles.css` | Has section classes (lighter-section, darker-section, cta-section) and bridge/cross-link styling will be needed |
| `js/script.js` | Active nav detection map needs updating if blog is removed |

### Gaps or Problems Being Addressed

1. No cross-linking between design.html and solutions.html — upsell pathway invisible
2. services.html is too thin to frame the client journey
3. solutions.html has wrong subtitle (copy-paste from design)
4. All CTAs are identical generic text
5. No JSON-LD structured data on any page
6. No Open Graph / Twitter Card meta tags
7. No canonical URLs
8. FAQ has zero solutions/automations questions
9. Blog in navigation with no content
10. H1 on index.html is an image, not text

---

## Proposed Changes

### Summary of Changes

- Fix solutions.html copy-paste error
- Add cross-link bridge sections between design ↔ solutions pages
- Customize CTA sections per page with contextual messaging
- Remove blog from navigation across all pages
- Update work.html to handle missing blog link
- Rewrite services.html as strategic hub with journey framing
- Reorganize faq.html and add solutions-specific questions
- Add contextual Q&A sections to design.html and solutions.html
- Add JSON-LD structured data to all pages
- Add Open Graph and Twitter Card meta tags to all pages
- Add canonical URLs to all pages
- Fix heading hierarchy issues (index.html H1)
- Add engagement model indicators to solutions.html
- Add CSS for new bridge/cross-link sections and FAQ inline sections

### Files to Modify

| File | Changes |
|------|---------|
| `services.html` | Full rewrite of main content — journey framing, weighted cards, "Better Together" section |
| `design.html` | Add cross-link bridge section before CTA, add 4 contextual FAQ questions, customize CTA text, add SEO meta tags, add JSON-LD |
| `solutions.html` | Fix subtitle, add cross-link to design, add 4 contextual FAQ questions, add engagement models, customize CTA, add SEO meta tags, add JSON-LD |
| `faq.html` | Reorganize sections, add 5 solutions questions, merge Q14/Q24, add JSON-LD FAQPage schema, add SEO meta tags |
| `index.html` | Fix H1 (add text H1, keep banner as decorative), add LocalBusiness JSON-LD, add OG tags, add canonical |
| `about.html` | Add OG tags, add canonical, add JSON-LD |
| `contact.html` | Add OG tags, add canonical, add JSON-LD |
| `portfolio.html` | Add OG tags, add canonical |
| `work.html` | Remove or update blog reference, add OG tags, add canonical |
| `blog.html` | Keep file but remove from navigation |
| `styles.css` | Add CSS for bridge sections, inline FAQ accordion, journey pathway visual |
| `js/script.js` | Update active nav detection map, add inline FAQ toggle functionality |

### Files to Delete

None — blog.html is kept but removed from navigation only.

---

## Design Decisions

### Key Decisions Made

1. **Hub + Spoke structure preserved**: Research confirmed separate service pages outperform unified pages for SEO and progressive disclosure. The hub just needs to be stronger.
2. **Hybrid FAQ approach**: Main FAQ page stays unified but contextual Q&A blocks are added to service pages. Research shows this converts better than either approach alone.
3. **Blog removed from nav, not deleted**: File stays for potential future use. Portfolio stays as "Coming Soon" since real projects are coming.
4. **Bridge sections use existing CSS patterns**: New cross-link sections use `darker-section` / `lighter-section` classes to maintain visual consistency.
5. **JSON-LD over microdata**: Easier to maintain, Google's recommended approach, works better with static HTML.
6. **NZ-broad SEO targeting**: Keywords focus on "New Zealand" rather than specific cities, with emphasis on small business empowerment angle.
7. **Value proposition**: "Empowering New Zealand small businesses with professional web design and smart digital solutions — built by a small business, for small businesses." (Can be refined later.)

### Alternatives Considered

- **Merging design + solutions into one page**: Rejected — kills SEO for individual service keywords and creates an overwhelming page.
- **Tiered packages page**: Rejected — the two service lines are different categories, not tiers. Tiering works within design.html (which already does this with maintenance plans).
- **Splitting FAQ across pages only**: Rejected — loses consolidated resource for general questions.

### Open Questions

None — all decisions resolved during scoping.

---

## Step-by-Step Tasks

### Step 1: Fix Solutions Page Copy-Paste Error

Fix the header subtitle on solutions.html that incorrectly describes "web design, maintenance" instead of solutions.

**Actions:**

- Change the subtitle paragraph (line ~68) from: "Our focus areas include web design, maintenance, and additional features that enhance your online presence."
- To: "Our focus areas include business integrations, workflow automations, and smart digital tools that streamline your operations and drive growth."

**Files affected:**
- `solutions.html`

---

### Step 2: Remove Blog from Navigation (All Pages)

Remove the Blog link from the navbar dropdown on every page. Keep the Work dropdown but only show Portfolio.

**Actions:**

- On every HTML page, find the Work dropdown menu and remove the Blog `<li>` item
- Update work.html to remove or restyle the blog card (replace with a "More coming soon" message or remove the blog side entirely)
- Keep blog.html file intact (just unreachable from nav)

**Files affected:**
- `index.html`, `about.html`, `services.html`, `design.html`, `solutions.html`, `faq.html`, `contact.html`, `portfolio.html`, `work.html`, `blog.html` (all navbar instances)
- `work.html` (blog card removal/update)

---

### Step 3: Add Cross-Link Bridge Section to design.html

Add a bridge section between the "Additional Features" section and the CTA, nudging visitors toward Solutions.

**Actions:**

- Insert a new `darker-section` before the CTA with content:
  - H6: "Ready to Go Further?"
  - Body: "Your website is just the beginning. Connect it to your business systems — CRM, calendar, email campaigns, and more — with our Solutions & Automations service. Reduce manual work and let your website work harder for you."
  - Button: "Explore Solutions & Automations" → `solutions.html`

**Files affected:**
- `design.html`

---

### Step 4: Add Cross-Link Bridge Section to solutions.html

Add a brief note near the top of solutions.html guiding visitors who don't have a website yet.

**Actions:**

- Insert a small callout/banner after the header overlay div but before the first section:
  - Text: "Don't have a website yet? Start with our Web & Design service to build your foundation, then come back here when you're ready to make it work harder."
  - Link: "Start with Web & Design →" → `design.html`
- Style as a subtle inline banner (not a full section — lighter, smaller, informational)

**Files affected:**
- `solutions.html`
- `styles.css` (add `.bridge-callout` style — subtle banner with left border accent)

---

### Step 5: Customize CTA Sections Per Page

Replace identical generic CTAs with contextual messaging.

**Actions:**

- **design.html CTA:**
  - H2: "Ready to Build Your Website?"
  - Body: "Whether you need a brand new site, a refresh of your current one, or ongoing maintenance — we'd love to chat about how we can help."
  - Button: "Let's Talk Design" → `contact.html`

- **solutions.html CTA:**
  - H2: "Let's Make Your Business Smarter"
  - Body: "Tell us about your workflow and we'll show you what's possible. Free discovery call — no obligations, no jargon."
  - Button: "Book a Free Discovery Call" → `contact.html`

- **services.html CTA:**
  - H2: "Not Sure Where to Start?"
  - Body: "That's completely fine — most of our clients start with a conversation. Tell us about your business and we'll point you in the right direction."
  - Button: "Get in Touch" → `contact.html`

**Files affected:**
- `design.html`, `solutions.html`, `services.html`

---

### Step 6: Rewrite services.html as Strategic Hub

Redesign the main content of services.html to frame the client journey rather than just linking to sub-pages.

**Actions:**

- **Header subtitle**: Update to the value proposition: "Empowering New Zealand small businesses with professional web design and smart digital solutions — built by a small business, for small businesses."

- **Section 1 — "How We Help" (lighter-section):**
  - Brief intro paragraph: "Whether you need a professional online presence, smarter business operations, or both — we've got you covered. Here's how it works."
  - Visual pathway (3 steps in a row using overlay-img cards or styled dividers):
    1. "Your Brand" — "You bring the vision and the business knowledge."
    2. "We Build" — "We design your website and connect the right tools."
    3. "You Grow" — "Your digital presence works for you, not the other way around."

- **Section 2 — Service Cards (darker-section):**
  - Two cards side-by-side (reuse existing `.side-by-side` pattern):
  - **Web & Design card** (left, visually weighted with a "Start Here" badge):
    - Image, title, brief description: "Everything you need to get online — custom websites, responsive design, branding, SEO, and ongoing maintenance plans starting at $200/month."
    - Button: "Explore Web & Design" → `design.html`
  - **Solutions & Automations card** (right):
    - Image, title, brief description: "Already have a website? Make it work harder. We connect your tools, automate your workflows, and build smarter systems that save you time."
    - Button: "Explore Solutions" → `solutions.html`

- **Section 3 — "Better Together" (lighter-section):**
  - H6: "Better Together"
  - Body: "Most of our clients start with a website and discover they need smarter systems behind it. That's exactly how we designed our services to work — Design builds your foundation, Solutions makes it powerful. You can start with either, but they're built to complement each other."
  - Optional: brief bullet list of combined examples (e.g., "A website with built-in booking" or "An online store with automated follow-ups")

- **CTA Section** (as defined in Step 5)

**Files affected:**
- `services.html`

---

### Step 7: Reorganize faq.html and Add Solutions Questions

Restructure the FAQ into clearer groups and add missing solutions/automations content.

**Actions:**

- **Reorganize existing 25 questions into 6 groups:**
  1. **Getting Started** — Q1 (What does ICU do?), Q2 (Small NZ business?), Q3 (International?), Q4 (How to get started?), Q25 (Update existing site?)
  2. **Web Design & Development** — Q5 (Timeline?), Q6 (Content/photos?), Q7 (Update myself?), Q8 (Mobile?)
  3. **Solutions & Automations** — NEW section (see below)
  4. **Pricing & Payments** — Q9 (Cost?), Q10 (Payment terms?), Q11 (GST?), Q12 (Refunds?)
  5. **Hosting, Support & Maintenance** — Q13 (Hosting?), Q14+Q24 merged (Ongoing support?), Q15 (Emergency?)
  6. **Working With Us** — Q16 (E-commerce platforms?), Q17 (Payment setup?), Q18 (Training?), Q19 (Branding packages?), Q20 (Logo only?), Q21 (Revisions?), Q22 (Communication?), Q23 (Outsource?)

- **Merge Q14 and Q24** into one comprehensive "What support do you offer after launch?" answer combining both.

- **Add 5 new Solutions & Automations questions:**
  1. "What kinds of business tasks can you automate?" — Lead follow-ups, booking confirmations, email campaigns, content scheduling, invoice reminders, data syncing between tools.
  2. "What tools and platforms do you integrate with?" — Google Workspace, Mailchimp, HubSpot, Calendly, Stripe, Xero, Slack, Notion, Zapier, Make, and more.
  3. "Do I need a new website to use your solutions service?" — No. Solutions work with any existing website or can be paired with a new build.
  4. "How much do integrations and automations cost?" — Depends on complexity. Simple integrations from $300 setup. Automations from $500. Monthly management available. Free discovery call to scope.
  5. "Will I understand how to use the tools you set up?" — Yes. Full training and documentation included. We build for handover, not dependency.

- **Update the quick-jump navigation links** at the top to match the new section groupings.

**Files affected:**
- `faq.html`

---

### Step 8: Add Contextual Q&A to design.html

Add 4 design-specific FAQ questions inline on the design page, above the CTA section (after the bridge section from Step 3).

**Actions:**

- Add a `lighter-section` with H6: "Common Questions About Web Design"
- 4 questions in accordion/toggle format:
  1. "How long does it take to build a website?" — (shortened version of FAQ Q5)
  2. "How much does a website cost?" — (shortened version of FAQ Q9)
  3. "Will I be able to update my site myself?" — (shortened version of FAQ Q7)
  4. "What's included in a maintenance plan?" — Brief overview pointing to the expanding cards above
- Each question is a clickable toggle that reveals the answer
- Link at bottom: "More questions? Visit our full FAQ →" → `faq.html`

**Files affected:**
- `design.html`
- `js/script.js` (add simple accordion toggle function for `.inline-faq-item`)
- `styles.css` (add `.inline-faq` styles)

---

### Step 9: Add Contextual Q&A to solutions.html

Add 4 solutions-specific FAQ questions inline on the solutions page, above the CTA section.

**Actions:**

- Add a `darker-section` with H6: "Common Questions About Solutions & Automations"
- 4 questions in accordion/toggle format:
  1. "What kinds of business tasks can you automate?" — (same as FAQ)
  2. "Do I need a new website to use your solutions service?" — (same as FAQ)
  3. "How much do integrations and automations cost?" — (same as FAQ)
  4. "What tools and platforms do you integrate with?" — (same as FAQ)
- Link at bottom: "More questions? Visit our full FAQ →" → `faq.html`

**Files affected:**
- `solutions.html`

---

### Step 10: Add JSON-LD Structured Data to All Pages

Add structured data for SEO and AI/voice search discoverability.

**Actions:**

- **index.html** — Add `LocalBusiness` schema:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ICU Media Design",
    "description": "Web design and digital solutions for New Zealand small businesses",
    "url": "https://icumediadesign.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Nelson",
      "addressCountry": "NZ"
    },
    "email": "hello@icumediadesign.com",
    "priceRange": "$$",
    "areaServed": "New Zealand"
  }
  ```

- **design.html** — Add `Service` schema + `FAQPage` schema for inline questions
- **solutions.html** — Add `Service` schema + `FAQPage` schema for inline questions
- **faq.html** — Add `FAQPage` schema covering all questions
- **about.html** — Add `Organization` schema
- **services.html** — Add `WebPage` schema with service offerings
- **contact.html** — Add `ContactPage` schema

All schemas go in `<script type="application/ld+json">` tags in the `<head>`.

**Files affected:**
- `index.html`, `about.html`, `services.html`, `design.html`, `solutions.html`, `faq.html`, `contact.html`

---

### Step 11: Add Open Graph and Twitter Card Meta Tags

Add social sharing meta tags to all pages.

**Actions:**

- Add to every page's `<head>`:
  ```html
  <!-- Open Graph -->
  <meta property="og:title" content="[Page Title] | ICU Media Design">
  <meta property="og:description" content="[Same as meta description]">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://icumediadesign.com/[page].html">
  <meta property="og:image" content="https://icumediadesign.com/imgs/enhancedlogo.png">
  <meta property="og:locale" content="en_NZ">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="[Page Title] | ICU Media Design">
  <meta name="twitter:description" content="[Same as meta description]">
  <meta name="twitter:image" content="https://icumediadesign.com/imgs/enhancedlogo.png">
  ```

- Add canonical URL to every page:
  ```html
  <link rel="canonical" href="https://icumediadesign.com/[page].html">
  ```

**Files affected:**
- All 10 HTML pages

---

### Step 12: Fix Heading Hierarchy

Ensure proper H1 → H2 → H3 structure on every page.

**Actions:**

- **index.html**: Add a visually-hidden text H1 ("ICU Media Design — Web Design and Digital Solutions for New Zealand Small Businesses") and keep the banner image as decorative. Use `sr-only` class or `clip` positioning to hide the text H1 visually while keeping it accessible/SEO-readable.
- **All pages**: Audit H6 usage — currently many section headings use `<h6>`. These should semantically be `<h2>` tags. Change all section-level `<h6>` headings to `<h2>` across all pages and update CSS selectors accordingly if any target `h6` specifically.
- Ensure CTA section `<h2>` tags remain as H2 (they already are — good).

**Files affected:**
- `index.html`, `about.html`, `design.html`, `solutions.html`, `faq.html`, `services.html`, `contact.html`, `work.html`, `portfolio.html`
- `styles.css` (update any `h6` selectors to `h2` equivalents or add class-based selectors)

---

### Step 13: Add Engagement Model Indicators to solutions.html

Add pricing/engagement signals to reduce uncertainty for SMB visitors.

**Actions:**

- Add a new `lighter-section` before the CTA (after the Automations section, before the inline FAQ) with:
  - H2: "How We Work Together"
  - 3 cards or columns:
    1. **One-Off Setup** — "We build and hand over. You own it. Starting from $300 for simple integrations."
    2. **Monthly Management** — "We manage and optimise your automations on an ongoing basis. Plans from $150/month."
    3. **Project-Based** — "For bigger builds — custom software, complex workflows, AI agents. Scoped and quoted per project."
  - Note: "Every engagement starts with a free discovery call. No surprises."

**Files affected:**
- `solutions.html`

---

### Step 14: Add CSS for New Components

Add styles for the new elements introduced in previous steps.

**Actions:**

- **Bridge callout** (`.bridge-callout`): Subtle inline banner with left border accent in brand blue, slightly different background from sections, max-width matching container, margin auto.

- **Inline FAQ** (`.inline-faq`): Accordion-style toggle list within a section.
  - `.inline-faq-item`: Question row with toggle indicator (+/−)
  - `.inline-faq-answer`: Answer text, hidden by default, slides open on click
  - `.inline-faq-item.active .inline-faq-answer`: Visible state
  - Match existing typography and spacing patterns

- **"Start Here" badge** (`.badge-start-here`): Small positioned label on the design card in services.html. Brand blue background, white text, positioned top-right of card.

- **Journey pathway** (`.journey-pathway`): Horizontal 3-step visual for services.html. Flexbox row, step numbers or icons, connecting lines between steps. Mobile: stack vertically.

- **Visually hidden text** (`.sr-only`): Screen-reader-only class for the index.html text H1:
  ```css
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  ```

**Files affected:**
- `styles.css`

---

### Step 15: Add Inline FAQ Toggle JavaScript

Add simple accordion functionality for the contextual Q&A sections.

**Actions:**

- Add to `js/script.js` a function `initInlineFAQ()` that:
  - Selects all `.inline-faq-item` elements
  - Adds click event listener on the question (`.inline-faq-question`)
  - Toggles `.active` class on the parent `.inline-faq-item`
  - Closes other open items in the same FAQ block (accordion behavior)
- Call `initInlineFAQ()` from the DOMContentLoaded listener

**Files affected:**
- `js/script.js`

---

### Step 16: Update Active Nav Detection

Update the nav detection map in script.js to account for blog removal and any nav changes.

**Actions:**

- In the `setActiveNavLink()` function, remove the blog.html mapping if present
- Confirm work.html still maps correctly to "Work" nav item
- Verify all other mappings are still accurate

**Files affected:**
- `js/script.js`

---

### Step 17: Validate and Cross-Check

Final validation pass across all changes.

**Actions:**

- Open each page and verify:
  - Navbar is consistent (blog removed from all)
  - Heading hierarchy is correct (one H1, proper nesting)
  - Meta tags are present and unique per page
  - JSON-LD is valid (test with a JSON validator)
  - Cross-links between design ↔ solutions work
  - Inline FAQ toggles work
  - CTAs have contextual messaging
  - No broken links
  - Mobile responsive (bridge sections, journey pathway, inline FAQ)

**Files affected:**
- All HTML pages (read-only verification)

---

## Connections & Dependencies

### Files That Reference This Area

- All HTML pages share the same navbar structure — blog removal must be consistent across all 10 files
- `js/script.js` references page names for active nav detection
- `styles.css` provides all visual styling — new components must use existing patterns

### Updates Needed for Consistency

- `CLAUDE.md` — No updates needed (documents workspace, not site content)
- `context/current-data.md` — Update page completion status after implementation
- `MEMORY.md` — Update with new patterns (inline FAQ, bridge sections, JSON-LD)

### Impact on Existing Workflows

- No impact on server.js or Stripe integration
- No impact on expanding card system
- No impact on page transitions
- Inline FAQ toggle adds new JS functionality but doesn't conflict with existing code
- H6 → H2 heading change may require CSS adjustments if any styles target `h6` directly

---

## Validation Checklist

- [ ] solutions.html subtitle correctly describes solutions, not design
- [ ] Blog removed from navigation on all 10 pages
- [ ] work.html updated to handle missing blog
- [ ] Bridge section on design.html links to solutions.html
- [ ] Bridge callout on solutions.html links to design.html
- [ ] CTAs are contextual (different text on design, solutions, services)
- [ ] services.html has journey framing, weighted cards, "Better Together" section
- [ ] faq.html has 6 reorganized sections including Solutions & Automations
- [ ] 5 new solutions questions added to faq.html
- [ ] Q14/Q24 merged into single answer
- [ ] 4 inline FAQ questions on design.html with working toggles
- [ ] 4 inline FAQ questions on solutions.html with working toggles
- [ ] JSON-LD structured data on all 7 content pages
- [ ] Open Graph meta tags on all pages
- [ ] Twitter Card meta tags on all pages
- [ ] Canonical URLs on all pages
- [ ] index.html has text H1 (visually hidden) + decorative banner
- [ ] Section headings changed from H6 to H2 across all pages
- [ ] Engagement model section on solutions.html
- [ ] New CSS components responsive on mobile
- [ ] No broken links across the site
- [ ] context/current-data.md updated with new status
- [ ] MEMORY.md updated with new patterns

---

## Success Criteria

The implementation is complete when:

1. A visitor can navigate from services → design → solutions (and back) with clear cross-links and contextual guidance at every step
2. Every page has unique meta title, description, Open Graph tags, canonical URL, and relevant JSON-LD structured data
3. The FAQ covers both service lines with solutions-specific questions, and contextual Q&A appears on both service pages
4. Blog is cleanly removed from navigation without broken links or orphaned references
5. Heading hierarchy is semantically correct on every page (one H1, H2 for sections)
6. All new components (bridge sections, inline FAQ, journey pathway) are responsive and follow existing design patterns

---

## Notes

- The value proposition ("Empowering NZ small businesses...") is a draft — can be refined post-launch
- JSON-LD URLs use `https://icumediadesign.com` as placeholder — update with actual domain when known
- Engagement model pricing on solutions.html ($300, $150/month) are estimates — owner should confirm before launch
- The H6 → H2 heading change is the highest-risk item — need to verify CSS doesn't break. Current styles use `.section-title` class-based styling in most places, but some may target `h6` directly
- Portfolio page intentionally left as "Coming Soon" — will be populated with real projects
- This plan does not touch the contact form functionality (data-integration="email") — that's a separate implementation task

---

## Implementation Notes

**Implemented:** 2026-02-28

### Summary

All 17 steps executed successfully. The website now has:
- Restructured services hub with journey pathway and weighted service cards
- Cross-linking bridge sections between design and solutions pages
- Contextual CTAs on all service pages
- Hybrid FAQ system (unified faq.html + inline Q&A on service pages)
- Solutions engagement model section with 3 pricing tiers
- Complete SEO: JSON-LD structured data, Open Graph/Twitter Card meta, canonical URLs on all pages
- Correct heading hierarchy (H1 per page, H2 sections, H3 subsections)
- Blog removed from navigation, work.html blog card replaced with contact CTA
- New CSS components: bridge-callout, inline-faq accordion, journey-pathway, badge-start-here, sr-only
- New JS: initInlineFAQ() accordion with close-others behavior

### Deviations from Plan

- design.html overlay card headings (Usability, Responsiveness, Aesthetics, eCommerce, SEO, Analytics) changed from H2 to H3 during validation — plan specified H6→H2 but these are nested within H2 sections, so H3 is semantically correct
- h6 subtitle tags on design.html pricing cards and Additional Features section were left as-is since they're styled as small labels, not structural headings

### Issues Encountered

- File edit errors when attempting to edit files not yet read in the current context — resolved by reading files first
- Context file write errors when files were modified since last read — resolved by re-reading and using Edit tool
