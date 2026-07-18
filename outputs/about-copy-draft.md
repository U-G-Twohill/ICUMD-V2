# About Page — Copy Deck (draft)

**Date:** 2026-07-18
**Status:** ✅ **SHIPPED** — approved and wired into `about.html` 2026-07-18.

**Decisions taken at approval:**
- Location: **"Nelson, NZ"** included (Uriah's call).
- **"About us" → "About"** everywhere — H1, nav, and footer links across all 8 pages.
- **Photo deferred.** The MS Paint placeholder stays for now; Uriah will replace
  it. He judged it not a blocker for the rest of the site. It remains the single
  highest-impact fix on this page.

**Two extra fixes found while wiring (see notes at the bottom):**
- The hover-reveal value cards hid their copy entirely on touch devices.
- About's meta description promised "the story, values and people" — wrong on
  all three counts after this rewrite.
**Derives from:** `context/positioning.md` (spine), and two constraints Uriah set
this session:

1. **About is not a story page.** *"The personal history seems irrelevant… it's
   just to show I'm a real person really."* It must land: trustworthy, small but
   attentive, able to help small businesses **because he is one**.
2. **The site legitimises, it does not sell to cold traffic.** Clients arrive by
   word of mouth and in-person leads. The reader is **verifying, not being
   convinced** — confirm, don't pitch.

---

## What's wrong with the current page

The existing `about.html` is built on the framing the spine explicitly disowns:

| Current copy | Problem |
|---|---|
| "handed a five-figure quote and a contract full of jargon" | Anti-industry framing — disowned |
| "No jargon, no smoke, no surprises in the invoice" | Anti-jargon; also defensive about pricing |
| "years of watching small businesses get talked into websites…" | Anti-industry, and shaky — ICU started July 2024 |
| "**We** thought there was a better way", "**Our** wins" | Team-"we" throughout — violates pronoun rule |
| "Real People, Real Solutions, Real Results" | Generic; says nothing |
| "Growing Together… growing carefully" | Filler, and reads tentative when the job is legitimising |

It also runs **6 sections** for a page that should be shorter than Home.

---

## Proposed shape — 5 sections

Trimmed from 6. "Our Story" and "Who You'll Work With" merge (the story *is* the
person). "Growing Together" is cut.

| # | Section | Job |
|---|---|---|
| 1 | Hero | Set the frame: this is about the person |
| 2 | Who you're dealing with | **The core section.** Photo + plain intro |
| 3 | How I work | The three commitments (reuses existing value images) |
| 4 | The basics | Flat legitimising facts |
| 5 | Close | Low-pressure, matches an actual mechanism |

---

## §1 — Hero

**H1:** About

**Sub:** The person you'll actually be working with.

> *Rationale:* "About Us" is team-"we" in the page's most prominent position.
> The subtitle does the page's whole job in eight words and sets up §2.
> **Flag:** nav still says "About us" — worth aligning, but that's a nav change
> across 9 pages, so raising rather than doing.

---

## §2 — Who you're dealing with

*(Photo of Uriah — see the blocker note at the bottom.)*

**H2:** Who You're Dealing With

I'm Uriah. I run ICU Media Design out of New Zealand — the design, the build,
the support, all of it.

That's not a stage I'm trying to grow out of. Working this way is what lets me
learn a business properly before building anything for it, and it's why you'll
always know what's being built, why, and what it's doing for you. You're talking
to the person doing the work, not someone relaying it.

I take on a small number of projects at a time so each one gets proper attention.
That does mean I'm not the right fit for everyone — and I'd rather say so early
than overpromise.

> *Rationale:* Carries the core promise almost verbatim. "Not a stage I'm trying
> to grow out of" turns the solo nature from an apology into a deliberate choice.
> The last line is a trust signal: someone verifying a referral is reassured by a
> person who names their own limits. No arc, no biography, no day job.

---

## §3 — How I Work

**H2:** How I Work
*(replaces "Our Values" — less corporate, and matches the verifying reader)*

**Clarity** — *Plain English, every step*
You'll always know what I'm building and why. If I can't explain what something
does for your business, it probably shouldn't be in the build.

**Partnership** — *You're in on it*
You see the work as it happens rather than a reveal at the end. Decisions get
made with you, and nothing important gets built without you knowing what it's for.

**Craftsmanship** — *The same care, every project*
Sole trader or established team, a full build or a small fix — it gets the same
attention. I'd rather do fewer things properly.

> *Rationale:* Keeps the three existing images (`clarity.jpg`, `partnership.jpg`,
> `Craftsmanship.jpg`) so this is a copy-only change. Removes the anti-jargon and
> invoice-defensiveness. "I'd rather do fewer things properly" reinforces
> small-but-attentive without claiming scarcity.

---

## §4 — The Basics

**H2:** The Basics
*(replaces "Our Journey So Far" — journey framing is story framing)*

| Icon | Heading | Line |
|---|---|---|
| calendar | Est. 2024 | Building for New Zealand businesses since. |
| user | One Person | Founder, developer, and your only point of contact. |
| flag | New Zealand | Local, working with businesses nationwide. |

> *Rationale:* Flat facts, no spin — exactly what a verifying reader wants.
> "Your only point of contact" is a genuine differentiator stated plainly.
> **Optional:** naming the town (Nelson) would make it more concretely real.
> Left out pending Uriah's call on how public he wants that.

---

## §5 — Close

**H2:** Sounds Like a Good Fit?

If you've got something in mind, or you're not sure yet and want to talk it
through first, I'm easy to get hold of.

**CTA:** → Start the Conversation

> *Rationale:* Deliberately soft — this reader is verifying, not deciding, and
> may well already be mid-conversation with Uriah offline. Removes "no pressure,
> no jargon". CTA matches the site's actual mechanism (contact form, no booking
> tool) per the spine's CTA rule.

---

## Outcome and outstanding items

**Resolved at ship time:**
- ~~Nav says "About us" vs H1 "About"~~ — aligned across all 8 pages, nav + footer.
- ~~Location undecided~~ — "Nelson, NZ" shipped.

**Found while wiring, fixed:**
- **Hover-reveal cards hid their copy on touch.** `.overlay-img .des p` is
  `opacity: 0; visibility: hidden` until `:hover`, and the mobile media query only
  changed font size — so on phones and tablets the Clarity / Partnership /
  Craftsmanship descriptions were permanently unreachable. Added a
  `@media (hover: none)` fallback mirroring the hover state. Also affects
  `design.html` (6 uses) and `solutions.html` (9 uses), which gain the same fix.
  *Verified the rule parses and is correctly inactive on desktop; not yet
  exercised on a physical touch device.*
- **Meta description** rewritten — it described a "story", "values" and "people"
  (plural), none of which match the page now.

**Still outstanding:**
1. **`imgs/uriah.jpg` is a hand-drawn MS Paint doodle.** Deferred by Uriah, not
   a blocker for the rest of the site — but on the page whose stated job is "show
   I'm a real person", a real photo will do more than any copy here.
2. **Values images** (`clarity.jpg` etc.) are generic stock landscapes with no
   relationship to the words. Fine for now; noted for a later pass.
