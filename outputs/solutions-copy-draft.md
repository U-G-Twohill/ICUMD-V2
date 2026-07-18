# Solutions Page — Copy Deck (draft)

**Date:** 2026-07-18
**Status:** DRAFT — not wired into `solutions.html`. For Uriah's review.
**Derives from:** `context/positioning.md`. The spine's brief for this page:
collapse the 6 equal cards into 3 outcome buckets, make AI *the how not the
headline*, add the booking confirm-first option, run an I/partnership-"we" pass,
and keep the Design bridge-callout.

---

## What's wrong now

**1. Team-"we" throughout — the biggest problem.** The page reads as a staffed
agency on almost every line: *"we learn how your business works"*, *"We build and
hand over"*, *"We manage and optimise"*, *"We find the right tools"*, plus "Our
Process" and "Our Solutions" as headings. This is the clearest voice-rule
violation left on the site.

> Note: **"How We Work Together" is fine and stays.** That's the partnership
> "we" (you + me), which the spine actively encourages. Only the team-"we" goes.

**2. Six equal cards flatten everything.** Lead Capture, Scheduling, Nurture
Flows, Connected Tools, Content & Reporting and AI Assistants all sit at the same
weight, so the reader has to work out which of six things they need. They don't
know — that's the point of §3 on Home ("you don't need to know which of these you
need").

**3. "AI-Powered Assistants" is a headline card.** The spine says AI is the
mechanism, not the pitch. As its own card it raises guards and competes with the
outcomes.

**4. Scheduling promises full automation only.** Currently *"automatic
confirmations so you never double-book again."* Home already offers the better
version — *"confirmed automatically or only once you approve"* — which matters to
anyone who doesn't want their calendar filled without a say.

**5. Duplicate, mismatched process.** Home has a 4-step process (Discover / Plan /
Build / Support). Solutions has a *different* 3-step one. Same company, two
processes.

---

## §Header

**H1:** Solutions & Automations *(unchanged)*

**Sub:** Connect what you already use, automate the busywork, and get your time
back.

> *Was:* "Connect your tools, automate your workflows, and let technology do the
> heavy lifting." Feature-led and slightly abstract. The new line ends on the
> outcome and echoes Home §2 ("so the day-to-day runs itself").

---

## §Bridge callout — keep, de-"our"

Don't have a website yet? Start with [Web & Design](design.html) to build the
foundation, then come back here when you're ready to make it work harder.
→ **Start with Web & Design**

---

## §1 — How It Works *(was "Our Process")*

**Sub:** From first conversation to long-term support.

Every project follows the same path: I learn how your business actually works,
pick the right tools, build the connections, and stick around to keep it running.

| Card | Copy |
|---|---|
| **Discover & Plan** | I learn how your business runs and where the time is actually going. |
| **Build** | I pick the tools, connect them, and build the automations around how you already work. |
| **Support** | I keep it running and adapt it as the business changes. |

> *Rationale:* Renamed to match Home's process vocabulary exactly, so it reads as
> the same process told briefly rather than a second, competing one. Keeps three
> cards (and the three existing images) rather than forcing a fourth.

---

## §2 — What I Can Build *(was "Our Solutions" — 6 cards → 3)*

**Intro:** Every one of these is an outcome, not a technology. You don't need to
know which you need — working that out is the first thing we do together.

### Never Miss an Enquiry
Enquiries captured the moment they come in, logged where you'll actually see
them, and followed up automatically. Nothing sits in an inbox for three days.
*(absorbs: Automated Lead Capture, Customer Nurture Flows)*

### Fill the Calendar
Online booking and calendar sync, with confirmations sent automatically — or held
for your approval first, if you'd rather keep a say in what lands in your week.
*(absorbs: Smart Scheduling — now carries the confirm-first option)*

### Get Your Time Back
Your tools talking to each other, reports and content that publish themselves,
and the repetitive admin quietly handled in the background — including with AI
where that's genuinely the right tool for it.
*(absorbs: Connected Business Tools, Content & Reporting, AI-Powered Assistants)*

> *Rationale:* Three outcomes instead of six features. "Get Your Time Back" is
> lifted straight from Home §3, so the two pages reinforce each other. AI now
> appears once, mid-sentence, as the mechanism — named but not headlined, per the
> spine. The intro reuses Home's "you don't need to know which of these you need"
> and its partnership "we".
>
> **Image note:** 6 cards → 3 leaves 3 of the existing images unused
> (`reminders`, `crmemail`, `sheets`, `documents`, `agents`, `calendar` — keep the
> best 3). Worth folding into the planned pre-launch asset pass.

---

## §3 — How We Work Together *(heading unchanged — partnership "we")*

| Card | Copy | Price line |
|---|---|---|
| **One-Off Setup** | I build it, then hand it over. You own it outright. | From **$300** for simple integrations. |
| **Monthly Management** | I look after your automations and keep improving them as you go. | Plans from **$150/month**. |
| **Project-Based** | Bigger builds — custom software, complex workflows, AI agents where they earn their place. | **Scoped and quoted per project.** |

**Footer line:** Every project starts with a free discovery call, and you'll have
a written scope before any work begins.

> *Rationale:* Only the team-"we" changes; structure and prices stay (verified
> consistent with `faq.html` and the JSON-LD). "AI agents where they earn their
> place" keeps AI honest without hiding it. The footer line replaces "No
> surprises" with the concrete thing that actually prevents surprises.

---

## §4 — FAQ

Keep as-is structurally. Needs the same team-"we" → I pass; the answers
currently say "We'll scope everything…".

---

## §5 — Close

**H2:** Let's Make Your Business Smarter *(unchanged)*

**Sub:** Free discovery call — no obligation.

Tell me how your week actually runs and I'll show you what's worth automating —
and what isn't.

**CTA:** → Start the Conversation *(already corrected 2026-07-18)*

> *Rationale:* Was *"Tell us about your workflow and we'll show you what's
> possible. No obligations, no jargon."* — team-"we" plus the disowned jargon
> line. "And what isn't" is the trust move: it says he'll talk you out of things,
> which is the spine's "only ever suggest what genuinely earns its place".

---

## Flags

1. **Touch fix already applied.** This page has 9 `.overlay-img` cards whose copy
   was invisible on phones until today's `@media (hover: none)` fix. This rewrite
   inherits it.
2. **Images** — collapsing to 3 buckets frees several images; fold into the
   planned pre-launch asset pass rather than picking now.
3. **Pricing verified consistent** across Solutions, FAQ and JSON-LD — no change
   proposed.
