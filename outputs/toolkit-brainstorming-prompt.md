# ICU Media Design — Delivery Toolkit Brainstorming Prompt

> **How to use:** Open a Claude Code session in `D:\Repos\Command Center Plan\`, run `/prime`, then paste the block below. Recommended next move after priming: `/scope` to formally walk the discovery → define → plan pipeline.

---

## Strategic frame

I'm finalising **Track A item 1 (ICU Media Design website, `D:\Websites\ICUMD Clone Designer\`)** for a `.co.nz` launch on Hostinger. The site lists a wide range of services I intend to offer — but as I reviewed the copy I realised that for several of them I know how to do the work in theory but I don't have **solid, repeatable processes** I can execute consistently and professionally.

I need a **delivery toolkit** that turns each service offering into a documented playbook I can run when a real client engagement lands. Without it, "yes I offer maintenance plans" is a claim with no spine behind it.

I want this brainstorming session to scope what that toolkit looks like — where it lives architecturally, what's in v1, and what defers. **Don't build anything yet.** Output should be a scope doc + plan, not implementation.

---

## Constraints driving this

- **Solo trader, evenings + weekends only** (full-time landscaping day job). v1 scope must be realistic for that bandwidth.
- **Launching ICUMD in the next ~few weeks**. Some toolkit minimum needs to exist by launch — enough that I can confidently say "yes I have a process for that" when a prospect asks.
- **Quality over speed, but minimum-not-exhaustive**. Same philosophy as the ICUMD website MVP scope.
- **One stated meta-goal** is workflow automation that lets agents do useful work while I'm at landscaping. Toolkit should be agent-friendly (markdown, structured, discoverable).

---

## Services that need playbooks (inventory)

From the ICUMD site copy, these are the services I publicly offer. Each needs *some* underlying process before launch (or a deliberate "deferred" call):

### Web & Design (`design.html`)
- **Custom website design + development** (responsive, mobile-first, SEO-ready)
- **Branding packages** (logo, colour palette, typography, social assets, business cards, brand guidelines, $500+ logo-only)
- **Maintenance plans**: Basic ($200/mo), Medium ($400/mo), Professional ($750/mo) — each with specific deliverables (security updates, backups at varying frequencies, performance monitoring, uptime monitoring, support response SLAs, periodic reports)
- **SEO audits**: Basic Checkup ($250 one-off PDF), Standard Audit ($450 + walkthrough), Advanced Strategy ($850 + consult)
- **Analytics**: One-Off Snapshot ($200), Monthly Reporting ($150/mo), Analytics+SEO Bundle ($350/mo)
- **Growth Add-Ons**: eCommerce integration, SEO optimisation, Analytics integration
- **Custom Plan**: bespoke combinations

### Solutions & Automations (`solutions.html`)
- **Discovery & Planning** (process)
- **Tool Selection & Setup** (process)
- **Automated Lead Capture** (forms, CRM, email sequences)
- **Smart Scheduling** (online booking, calendar sync)
- **Customer Nurture Flows** (email campaigns, follow-ups)
- **Connected Business Tools** (Google Workspace, Xero, Slack, Notion sync)
- **Content & Reporting** (blog publishing, newsletters, social, automated reports)
- **AI-Powered Assistants** (chatbots, AI agents)
- **Engagement models**: One-Off Setup ($300+), Monthly Management ($150+/mo), Project-Based

### Cross-cutting
- **Hosting setup help** (typically Hostinger; SSL + backups)
- **Training & handover** (1-on-1 Zoom, video tutorials, written documentation)
- **Stack fallbacks** — I always opt for custom build, but realistically clients will sometimes require **Squarespace / Shopify / WordPress / Webflow / Wix** etc. I need playbooks for working in stacks I'm not the strongest in
- **Site audits** (general; distinct from SEO audits — accessibility, performance, structure, security)
- **Payment terms** (50/25/25 split for projects; future card payments for one-off packages)

### Integrations explicitly named
Google Workspace, Mailchimp, HubSpot, Calendly, Stripe, Xero, Slack, Notion, Zapier, Make. Each should be at least a "have I done this before? what's the recipe?" reference.

---

## Specific gaps I flagged

When reviewing the ICUMD copy, the categories where I have *no* solid process today:

1. **Maintenance — each type**: security updates (what exactly is checked?), backups (what's backed up, where, restore process?), performance monitoring (what tools, what thresholds?), uptime monitoring (what tool, alert routing?). Different cadences per plan tier.
2. **SEO framework**: a repeatable audit methodology that produces consistent output across the three tiers.
3. **Site audits**: similar — repeatable methodology with consistent deliverable format.
4. **Stack fallbacks**: when a client says "I want to keep my Squarespace site", what's my checklist?

---

## Architectural questions to answer

This is the core of what I want the brainstorming to resolve:

1. **Inventory existing repos.** I already have `Site-Audits`, `Quoting-Tools`, `GlensToolkit`, `GlenTools`, `Design-Integrations`, `Integrations-and-Project-Management` (+ project-hub variant) under `D:\Repos\`. What's already in those? Does any of the inventory above already have a home?
2. **One toolkit or many?** Federated specialised repos (extend `Site-Audits` with SEO subdir, etc.) vs one new mega-toolkit (`delivery-toolkit` or similar) vs hybrid?
3. **Naming and boundaries.** If a new repo, what's it called? What's its scope vs the existing repos? When do I add to existing vs spin up new?
4. **Format conventions.** Markdown playbooks per service? Scripts where automation makes sense? Templates clients can fill? Claude slash-commands for repeatable work? Some combination?
5. **Discovery / agent-friendliness.** When a client request comes in (or when I delegate to Claude), how does anyone find the right playbook? CLAUDE.md indexes? Naming convention? Search?
6. **v1 minimum scope.** What's the *shortest* set of playbooks that lets me credibly say "yes I have a process for that" by ICUMD launch? Which services can stay theoretical for v1 and become formalised once a real engagement triggers them?
7. **Update cadence.** Living playbooks (refined as I run real engagements) vs static specs. Probably the former — but how is improvement captured?

---

## What I want out of this session

- A scope doc (saved in Command Center `plans/`) capturing the architectural decision and v1 contents
- An ADR-style note if a clear architectural call gets made (e.g. "ADR 0004: New `delivery-toolkit` repo, federated structure")
- A `/create-plan` ready to drive the actual repo / file creation in a follow-up session
- An updated entry in Command Center's status / track plan reflecting this as new in-flight work

**Don't build anything.** Don't create the toolkit repo this session. Just scope it. Building happens after I've finished the ICUMD content/layout pass.

---

## Cross-machine note

If you need it, the ICUMD MVP scope plan that established the launch gate this is supporting lives at `D:\Websites\ICUMD Clone Designer\plans\2026-05-08-mvp-scope.md`, and the original site audit at `D:\Websites\ICUMD Clone Designer\outputs\audit-2026-05-08.md`. Feel free to read either if scoping the toolkit needs more context on what's already documented vs what's a real gap.
