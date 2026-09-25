# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One user: the author, quitting smoking under a self-managed nicotine patch taper (21 → 14 → 7 mg).
Single device: an iPhone 16 Pro (402×874 CSS px, Dynamic Island), app installed to the home screen as a PWA, used offline.

Three usage situations, in priority order when they conflict on screen:

1. **Craving in progress** — phone pulled out mid-craving: one hand, stressed, often outside or on a break. The craving timer must be reachable in one gesture; everything else yields.
2. **Daily ritual** — calm moment, once a day: log the patch application with its application site, do the check-in.
3. **Passive glance** — short opens several times a day to read the streak, money saved, next badge.

Secondary audience: LinkedIn readers who only ever see screenshots taken in demo mode. They never use the app.

## Product Purpose

Help one person stay smoke-free through a patch taper, by making the journey legible: what has happened (facts), where the protocol stands, and what it has earned.
Success = the user is still smoke-free at the end of the protocol and opened the app instead of smoking when a craving hit.
Second purpose: material for LinkedIn content about both the quit journey and the build.

The quit never waits for the app: every fact can be backdated, and there is no "pre-quit" state.

## Positioning

- Built around a **user-defined protocol** (dose + duration per step, free-text brand), not a fixed program.
- **Everything shown is derived from recorded facts**; nothing is granted, nothing is stored as a total. XP, level, badges and money saved re-score from the journal.
- **One tracker, one streak.** No patch streak, no check-in streak.
- A lapse is a fact with a defined cost, never a verdict. A slip costs its smoke-free day and its cigarettes. A relapse (three calendar days in a row with a lapse) also restarts the streak, resets the streak multiplier and drops the level one threshold. XP, badges and smoke-free days stay. The cost is announced before it lands, in a neutral tone.

Explicitly refused:

- Guilt-inducing or medical tone: shock imagery, moralising, failure vocabulary, patient posture.
- Product noise: accounts, social, paywall, ads, re-engagement notifications.

## Operating Context

- iPhone, iOS 26, standalone PWA, offline-capable. Local-first: IndexedDB on the device, JSON export/import as the only backup, periodic in-app export nudge.
- Milestones, shipped in order: **M1 Core** (quit moment + elapsed counter, editable protocol, patch application log with application site, patch calendar, craving timer + intensity 1–3 + tags, lapse log, export/import, debug panel) → **M2 Motivation** (XP, levels, streak multiplier, badges with health milestones, money saved, craving stats, check-in, encouragement of the day, demo mode) → **M3 Online** (VPS deploy, push sender, push reminders).
- Push (M3): daily patch reminder, eve + day of a step change, badge reached, encouragements — never at night, inside a user-chosen window.
- Demo mode (`?demo=1`) shows a seeded fictional journey for screenshots and never touches real data. The debug panel ships in prod, hidden, on a sandbox journal with an adjustable clock.

## Capabilities and Constraints

- Vocabulary is binding: `CONTEXT.md`. Use its terms in UI copy, never a synonym listed under _Avoid_.
- UI strings are French, centralised in one strings module. Everything else is English.
- The app tracks one thing: being smoke-free. Only tobacco and nicotine are ever mentioned.
- Money is the user's weekly tobacco spend, gross, in integer cents; every cigarette smoked in a lapse is subtracted from money saved and cigarettes not smoked; only the display layer divides.
- Two elapsed figures: streak (restarts on a relapse, survives a slip) and smoke-free days (never resets). The hero shows the streak, the totals card the smoke-free days; after a slip the home also says how long since the last cigarette. Personal best streak appears only once a relapse exists.
- Application site is auto-suggested, switchable, never the same as the previous one.
- Craving intensity is 1–3; tags are optional and offered after the timer. Check-in mood is 1–5.
- Out of scope: plasma nicotine curve, shareable card, "comeback" badge, per-brand presets, 16 h patches.
- Architecture decisions: `docs/adr/0001` (local-first + dumb push sender), `docs/adr/0002` (state derived from a journal of facts).

Undecided: final product name (`quit` is provisional), domain, XP numbers (tuned in an M2 prototype), default step durations.

## Brand Commitments

- Name: `quit`, provisional.
- Voice: **complicit and direct** — informal "tu", the tone of a friend who already quit: frank, a little humour, never moralising. Applies to labels, empty states and lapse handling.
- Encouragements are a separate, hand-written library in the author's own voice, each citing one of the user's real figures. They are written with the author, never generated as filler.
- Typography constraint (binding): open-source typefaces only, and not the usual AI-default picks; a lesser-known face is welcome. The choice itself belongs to the design pass.
- No visual identity is committed. The three style variants of the earlier prototype (Instrument / Affiche / Registre) were all rejected; its model ideas were kept.

## Evidence on Hand

- Domain glossary: `CONTEXT.md`. Decisions: `docs/adr/`.
- Real data will be the user's own journal. Screenshots for publication come from demo mode's fictional journey, never from real data.
- Placeholder PWA icons in `public/` (scaffold, not a brand asset).
- Not available yet, do not fabricate: health milestone facts (each must be sourced), encouragement texts, XP values, default step durations from official notices.

## Product Principles

1. **The craving moment wins.** When needs conflict, the person mid-craving with one free hand is the one being served.
2. **Facts in, state out.** Show only what the journal proves; every figure must be traceable to recorded facts and a real source.
3. **A lapse is recorded, not judged.** It has a clear cost and a clear way forward; it never erases what was earned.
4. **The protocol belongs to the user.** The app follows the taper the user defined and never alters it.
5. **Quiet by default.** No accounts, no social, no re-engagement; the app speaks once a day at most, in a window the user chose.
