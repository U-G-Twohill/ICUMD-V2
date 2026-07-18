# Design Page — Copy Deck (draft)

**Date:** 2026-07-18
**Status:** DRAFT — not wired into `design.html`. For Uriah's review.
**Derives from:** `context/positioning.md`, and Uriah's scope call (2026-07-18):
both Design and Solutions are far more granular than the brief needs, every
engagement is tailored, and the maintenance tiers are over-specified. Pricing
decision: **"from" anchors only.**

---

## The finding that reframes this

The page is not just too detailed — **it's detailed about the wrong things.**

Right now `design.html` enumerates roughly **13 products**: three maintenance
tiers, a custom plan, three SEO audit tiers, an analytics package, and three
growth add-ons — most with full inclusion lists.

Meanwhile **the actual website build has no section at all.** The page goes
straight from design principles to maintenance plans. What a site from ICU
involves, and what it roughly costs, appears *only* in the FAQ and the JSON-LD —
never in the page body.

So the primary product is invisible while the ancillary ones have catalogues.

---

## Proposed shape

| # | Section | Change |
|---|---|---|
| 1 | **The Build** | **NEW** — the missing primary product, from $1,500 |
| 2 | Design principles | Keep 3 cards, de-"we" |
| 3 | Keeping It Running | 4 cards (Basic/Medium/Professional/Custom) → **1**, from $200/m |
| 4 | Audits & Insights | 3 SEO tiers + analytics → **1 named offer**, from $250 |
| 5 | Adding More Later | 3 add-on cards → **one short paragraph** |
| 6 | FAQ | Keep; de-"we", strip SLA claims |
| 7 | Close | Rewrite |

**13 enumerated products → 4 named things plus a build.**

---

## §Header

**H1:** Web & Design *(unchanged)*

**Sub:** A site built around how your business actually works — then looked after
so it keeps working.

> *Was:* "Custom websites, ongoing maintenance, and features that grow with your
> business." Reads as a product list; the new line is one promise with the
> ongoing relationship built in.

---

## §1 — The Build *(new section)*

**H2:** The Build

Most projects start here: a website built from scratch around your business,
rather than a template bent into shape.

I learn how you actually work and who you're trying to reach, then design and
build something that reflects it — fast, easy to use on a phone, and structured
so search engines can find it. You'll see it as it comes together, not as a
reveal at the end.

Every build is scoped to what the business actually needs, so the shape varies.
**Most sites start around $1,500**, with larger or more involved builds quoted
once we know what's involved.

> *Rationale:* Fills the gap. One anchor, no tiers, no inclusion list. "Rather
> than a template bent into shape" is a concrete differentiator that doesn't
> attack anyone. Carries the core promise ("you'll see it as it comes together").

---

## §2 — Design *(keep 3 cards)*

**Sub:** Creating digital experiences that connect. *(unchanged)*

| Card | Copy |
|---|---|
| **Usability** | Easy to use and easy to navigate, for everyone who lands on it. |
| **Responsiveness** | Looks and works right on whatever device it's opened on. |
| **Aesthetics** | Visually sharp, and consistent with how your brand already presents. |

**Closing line:** Your website is often the first interaction someone has with
your business. Every decision in it is deliberate — from the layout down to the
structure search engines read.

> *Rationale:* Copy-only. Drops the team-"we" in "we build with scalability in
> mind". Keeps all three images.

---

## §3 — Keeping It Running *(was "Maintenance": 4 cards → 1)*

**H2:** Keeping It Running

A website isn't finished at launch — it needs updating, backing up, and
occasionally rescuing. I look after that so you don't have to think about it.

What that involves depends on the site. A simple brochure site needs very little;
something with bookings, payments or regular content needs more attention. So
rather than pick a tier, we agree what yours actually needs.

**Ongoing support starts from $200/month**, scoped to the site.

> *Rationale:* Replaces Basic ($200) / Medium ($400) / Professional ($750) /
> Custom, and **removes every service-level promise** — 99.9% uptime, 24- and
> 48-hour response guarantees, daily backups, quarterly and monthly reports.
> Those were open-ended obligations for one person to carry, per client. The
> anchor survives so budget still self-qualifies.
> **"Occasionally rescuing" quietly plays the ICU = Intensive Care Unit note.**

---

## §4 — Audits & Insights *(was 3 SEO tiers + analytics → 1)*

**H2:** Audits & Insights

**SEO audit.** A clear read on how your site is performing in search and what's
holding it back — what's working, what's broken, and what's worth fixing first.
You get it written up plainly, and I'll walk you through it. **From $250**,
depending on the size of the site.

**Analytics.** If you want to know what people actually do on your site — where
they come from, what they read, where they drop off — I'll set that up and make
sense of it for you.

This is often the best place to start if you're not ready for a rebuild. It's low
commitment, and you'll come away knowing whether one's even warranted.

> *Rationale:* Uriah rates these and wants them kept. Collapses Basic $250 /
> Standard $450 / Advanced $850 into one offer with a floor. Drops the emoji
> headers and the three inclusion lists. The closing line positions the audit as
> the low-risk front door — which is what it is commercially, and it fits the ICU
> "diagnosis" reading.

---

## §5 — Adding More Later *(was 3 "Growth Add-Ons" cards → one paragraph)*

**H2:** Adding More Later

You don't have to decide everything up front. Plenty of sites start simple and
grow — an online store, proper SEO work, analytics, booking, payments. If it
makes sense later, it gets added later.

If a site is likely to grow in a particular direction, I'll build with that in
mind from the start, so adding it doesn't mean starting again.

> *Rationale:* Same three ideas, no longer three products demanding evaluation.
> The second paragraph is the genuinely useful bit and is currently unsaid
> anywhere on the site.

---

## §6 — FAQ

Structurally fine. Needs: team-"we" → I, and **removal of the SLA claims** that
§3 no longer makes (`design.html:505` still cites "$200/month for Basic,
$400/month for Medium, $750/month for Professional").

---

## §7 — Close

**H2:** Ready to Go Further?

Whether you need a site built, an honest look at the one you've got, or just
someone to keep it running — start with a conversation and we'll work out which.

**CTA:** → Start the Conversation

---

## Flags

1. **JSON-LD needs updating.** `design.html` carries the tier prices and a
   maintenance-plan FAQ answer in structured data. If the tiers leave the page,
   they must leave the schema too or Google will surface prices the site no
   longer offers.
2. **`services.html` cites "$200/month"** and will need a consistency pass.
3. **`faq.html`** repeats the maintenance tiers — same pass.
4. **Freed images:** collapsing the plan cards frees `basic_plan`, `medium_plan`,
   `professional_plan`, `custom_plan`. For the pre-launch asset pass.
