# Scope Definition: Website Launch Readiness

## Problem Statement

ICU Media Design's website has strong individual pages but lacks cohesion between its two service lines (Design and Solutions), has no upsell pathway, weak SEO foundations, an underdeveloped FAQ, and several placeholder pages. The site needs to feel like a unified, professional, launch-ready product that converts NZ small business visitors into clients.

## Target Users

New Zealand small business owners who:
- Need a website built or redesigned (Design entry point)
- Already have a website but need smarter systems behind it (Solutions entry point)
- May not be technically sophisticated — need clear, jargon-free guidance
- Are price-conscious and want to understand costs before committing

## Value Proposition (Draft)

**"Empowering New Zealand small businesses with professional web design and smart digital solutions — built by a small business, for small businesses."**

*(Can be refined later — captures the peer-to-peer, levelling-the-playing-field positioning.)*

---

## MVP Requirements (Must Have)

### Phase 1: Quick Wins & Cross-Linking

1. **Fix solutions.html copy-paste error** — Header subtitle incorrectly says "web design, maintenance" instead of solutions/automations
2. **Add cross-link bridge section on design.html** — After the main cards, before CTA: "Need more than a website? Explore Solutions & Automations" with link
3. **Add cross-link bridge section on solutions.html** — Near the top: "Don't have a website yet? Start with Web & Design" with link
4. **Customize CTA sections per page** — Design CTA: "Let's build your website", Solutions CTA: "Book a free discovery call", generic pages: "Get in touch"
5. **Remove blog from navigation** — Keep the file but remove nav link until content exists
6. **Keep portfolio as "Coming Soon"** in nav — will be populated with real projects

### Phase 2: Services Hub Redesign

7. **Rewrite services.html as a strategic hub page:**
   - Client-journey framing: "Whether you need a professional online presence, smarter business operations, or both"
   - Design card with "Start Here" / "Most Popular" visual weighting
   - Solutions card positioned as "Ready to do more?"
   - "Better Together" section explaining combined value
   - Simple visual pathway: Your Brand → Website (Design) → Smart Systems (Solutions) → Growth
8. **Ensure services.html works as a standalone landing page** — visitors from search should understand the full offering without navigating elsewhere

### Phase 3: FAQ Rework (Hybrid Approach)

9. **Reorganize faq.html into clearer groups:**
   - Getting Started (general, process)
   - Web Design & Development
   - Solutions & Automations (NEW — currently no solutions questions exist)
   - Pricing & Payments
   - Ongoing Support
10. **Add 3-5 solutions-specific questions** — What can be automated? What integrations do you support? How much do solutions cost? Do I need a new website first?
11. **Merge Q14/Q24 overlap** (post-launch support questions)
12. **Add 3-5 contextual Q&A blocks to design.html** — design-specific questions near bottom of page
13. **Add 3-5 contextual Q&A blocks to solutions.html** — solutions-specific questions near bottom of page
14. **Add FAQPage JSON-LD schema** to faq.html, design.html, and solutions.html for AI/voice search

### Phase 4: SEO Improvements (All Pages)

15. **Audit and improve meta titles and descriptions** across all pages:
    - Target NZ-specific keywords ("web design New Zealand", "business automation NZ", "small business website NZ")
    - Emphasise the levelling-the-playing-field angle for small businesses
    - Ensure each page targets unique keywords (no cannibalization)
16. **Add Open Graph and Twitter Card meta tags** to all pages for social sharing
17. **Add canonical URLs** to all pages
18. **Improve heading hierarchy** — ensure proper H1 → H2 → H3 structure on every page (one H1 per page)
19. **Add alt text to all images** that are missing it
20. **Add structured data (JSON-LD):**
    - `LocalBusiness` schema on index.html (business name, location NZ, services)
    - `FAQPage` schema on FAQ and service pages
    - `Service` schema on design.html and solutions.html

### Phase 5: Solutions Page Refinement

21. **Add engagement model indicators** — "Starting from" pricing or project type descriptions (one-off setup vs. monthly retainer vs. project-based)
22. **Consider adding expanding cards to solutions.html** — match the design page pattern for UI consistency
23. **Add a scenario/use-case section** — "A cafe owner needed X, so we built Y" (even hypothetical for now)

---

## Nice-to-Have (Post-MVP)

- Remove jQuery dependency (~280KB for 2 function calls) — replace with vanilla JS
- Set up SCSS build pipeline (scripts added, need `sass` CLI installed)
- Implement contact form submission handler (wire `data-integration="email"`)
- Get Stripe payments functional with real keys
- Add page speed optimizations (lazy loading images, minification)
- Add accessibility audit and improvements
- Create success.html and cancel.html for Stripe redirect flows

## Out of Scope

- Blog content creation or blog page development
- Full e-commerce / shop functionality
- Client portal or dashboard
- Mobile app
- Multi-language support
- Complete rebrand or logo redesign

## Technical Approach

- All changes are HTML/CSS/JS — no build tools required for the core work
- Follow existing patterns: expanding cards, section structure, CSS variables
- SEO meta tags added directly to HTML `<head>` sections
- JSON-LD structured data as inline `<script>` tags
- Cross-link sections built as new `.lighter-section` or `.darker-section` blocks
- Follow performance guidelines: no backdrop-filter on large elements, transform/opacity only for animations

## Constraints

- Solo developer with a day job — work needs to be completable in focused sessions
- No budget for external tools or services (all solutions must be self-hosted or free-tier)
- Must work with existing tech stack (vanilla HTML/CSS/JS, no framework migration)
- Content for portfolio page depends on finishing current client projects
- Stripe integration requires real API keys (not blocked for this scope, but noted)

## Success Criteria

1. All pages feel cohesive — a visitor can naturally flow from services → design → solutions without confusion
2. The Design → Solutions upsell pathway exists and feels natural, not pushy
3. FAQ answers questions relevant to both service lines
4. Every page has proper SEO meta tags, structured data, and heading hierarchy
5. Blog is removed from nav; portfolio shows "Coming Soon" cleanly
6. A non-technical NZ small business owner can land on any page and understand what ICU offers within 10 seconds
7. Site passes basic SEO audit (proper titles, descriptions, schema, headings, alt text)
