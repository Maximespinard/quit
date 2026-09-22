# Design References — Quit (Nicotine Taper Companion)

Research collected from Refero (refero.design) for a French-language, mobile-first iPhone PWA that tracks a single smoke-free streak under a nicotine patch taper, with adult-leaning gamification (streak counter, XP/level bar, multiplier, badges), a one-tap craving timer, a protocol calendar, and stats. Goal: a real, modern product UI — not a skeuomorphic or material-metaphor "wellness app" look.

All screens below are iOS, sourced from Refero. Each entry: what to borrow (layout/hierarchy/pattern) and what not to borrow (brand color, mascot, anything product-identifying).

---

## 1. Streak / day-counter hero

### Mindllama — Activity screen
- Refero: https://refero.design/screens/ce1ccfef-d2c0-47e6-a3d7-eacf666c2c7b
- App: Mindllama (breathing exercises companion)
- Borrow: the streak number sits inside a single oversized rounded-square outline, centered, with only the number and "Day streak" label inside it — no icon, no illustration competing for attention. Segmented control above (Activity / Settings / What's New) keeps navigation out of the hero's way. Calendar below uses dots for empty days and a solid dark pill for "today," which reads instantly without color-coding every state.
- Do not borrow: the pastel sky-blue accent, the rounded stroke-only "blob" shape aesthetic (reads a bit cute), Mindllama's branding/icon row.

### Foodvisor — Streak celebration screen
- Refero: https://refero.design/screens/0590e3dd-071b-4993-b48f-34a17594fe1b
- App: Foodvisor (calorie counter)
- Borrow: the number is fused directly into the flame/icon shape rather than sitting beside it — a good density trick for making one glyph do double duty as icon and hero stat. Weekly day-by-day strip directly under the headline number reinforces the streak without a full calendar.
- Do not borrow: the flame icon itself (too tied to Duolingo-style streak iconography and to lighting things on fire — wrong association for a tobacco-quit app), the serif "day streak!" treatment, orange as an accent (reads food/energy, not clinical calm).

### Checker — Analytics/streak dashboard (dark mode)
- Refero: https://refero.design/screens/224e489f-5490-4298-bd24-09ac58976934
- App: Checker (streak-building utility)
- Borrow: as a secondary/stats-tab reference, not the home hero — shows how to present a "longest streak" timeline as a horizontal bar chart across months, in a genuinely dark, low-chrome, data-first layout. Useful for the Stats section of this app rather than the home screen.
- Do not borrow: the indigo/blue brand accent, the generic "Overview / Analytics / Check-Ins" tab labels.

---

## 2. Level / XP bar and rank presentation (kept adult)

### Imprint — XP summary screen
- Refero: https://refero.design/screens/74203bea-84c1-4811-9574-455b700660ee
- App: Imprint (learning app)
- Borrow: XP is presented as a small line chart with one highlighted data point and a tooltip, plus a large plain numeral for "total lesson XP" and a quiet secondary row for "lifetime XP." Nothing cartoonish — it reads closer to a fitness or finance app's stat card than a game. Good model for a level/XP treatment that stays adult: chart + big number + one supporting row, black CTA button.
- Do not borrow: Imprint's mint-green accent and serif-adjacent rounded sans, the "Continue" onboarding-flow framing (this is a step screen, not a persistent home element).

### Google Maps — Local Guide level/badges profile
- Refero: https://refero.design/screens/a4d118b8-b14d-4924-84ca-c02d7a653a2d
- App: Google Maps (Local Guides program)
- Borrow: this is the strongest adult "rank" reference found — "Local Guide · Level 9" as plain text hierarchy (label small/gray, level number-adjacent, not oversized), a single thin horizontal progress bar with numeric endpoints (50,000 / 57197/100000) instead of a game-style radial gauge, and a horizontally scrollable badge row directly beneath. This is exactly the register to aim for: contribution/status system for adults, not a kids' app leveling mechanic.
- Do not borrow: the orange star badge icon and Google's specific badge illustrations, the "Join Local Guides" upsell card framing.

---

## 3. Badges / achievements grid — locked vs unlocked

### Opal — Gems (achievements) grid
- Refero: https://refero.design/screens/c594dbee-fc8f-4c25-8c62-8893f068db1c
- App: Opal (focus/app-blocking)
- Borrow: true dark-mode, two-column card grid where locked achievements show a blurred colored glow behind a plain white lock glyph (the color hints at what's inside without revealing it), each card carries a thin progress bar even while locked, and one unlocked card at the bottom shows the payoff (a crisp gem image, no lock). This is the best "adult" locked/unlocked treatment in the set — feels closer to a premium subscription-tier UI than a kids' sticker book.
- Do not borrow: Opal's specific gem/gemstone concept and naming ("Skilled Gem," "Loyal Gem"), the productivity/focus-hour unlock criteria.

### Imprint — "Your Badges" grid
- Refero: https://refero.design/screens/fb5c77d4-4f5f-422a-8b4b-40ac491f9123
- App: Imprint (learning app)
- Borrow: extremely restrained light-mode version of the same idea — plain gray circles with a centered lock icon for locked slots, full-color illustrated circles for unlocked ones, uniform 3-column grid with generous whitespace. Good reference for a "quiet" badges screen that doesn't compete with the home hero for visual weight.
- Do not borrow: the specific badge illustrations (colorful abstract art, not on-brand for this app), the off-white warm background tint.

### Apple Games — Achievements dashboard
- Refero: https://refero.design/screens/ad86fe4b-167b-4e7e-966c-1ddeeda5c9af
- App: Apple Games
- Borrow: the "0/31 · Total Completed" counter placed above the grid as plain large numerals (not a progress ring) is a clean way to summarize overall badge progress before the user even scrolls. Clear "Completed" vs "Locked" section headers rather than mixing states in one undifferentiated grid.
- Do not borrow: the dark gradient background and pixel-art badge illustrations, the avatar/username row (social-gaming framing, wrong tone here).

---

## 4. Calendar / timeline of a phased program

### Alive — History (program week/day timeline, dark mode)
- Refero: https://refero.design/screens/c099e0a8-187f-4e43-a630-d8925f685bb0
- App: Alive (workout/fitness)
- Borrow: each entry is a card split into a bold semicircular "Week / Day" numeral block (left) and program-name text (right), with real calendar dates running down the left margin as a vertical timeline connecting entries. This maps almost directly onto a patch-taper protocol: replace "Week 1, Day 1 — Legs Get It Beginner" with "Week 1, Day 3 — Patch step 3 (14 mg)". Strong pattern for showing where you are in a multi-phase program at a glance.
- Do not borrow: the yellow/navy sport palette, "Journey" tab naming, workout-specific iconography.

### The Body Coach — "Your Programme" week list
- Refero: https://refero.design/screens/53614f09-d9b5-4256-b604-af87f214b85b
- App: The Body Coach (Joe Wicks fitness)
- Borrow: a flat expandable list of phases ("Week 1" through "Week 4") with a chevron to reveal detail per phase — simpler than a full calendar grid and better suited to a taper protocol with a handful of discrete dose steps rather than daily granularity. Good alternate/complementary pattern to Alive's timeline when the phase count is small.
- Do not borrow: the community/social "Join the community" CTA and hashtag framing, the light-blue fitness-brand palette.

### Unwind — History (month calendar + streak stats)
- Refero: https://refero.design/screens/dafd7c5d-8b6e-4b9a-a3d3-2f5b7cf9a212
- App: Unwind (stress/sleep/breathwork)
- Borrow: full month grid with muted dots marking logged days and one dark filled cell for the selected/today date, paired with two compact "Current streak / Longest streak" stat cards directly under the calendar. This is the right density for a month-view "did I log today" calendar that also answers the streak question without a separate screen.
- Do not borrow: the blue gradient background treatment, Unwind's specific typography pairing.

---

## 5. One-tap SOS action + full-screen calm timer

### Roots — Emergency unblock confirmation
- Refero: https://refero.design/screens/51c241c6-541c-4781-8d72-ef8e0c438c6d
- App: Roots (app blocker / dopamine detox)
- Borrow: this is the closest real-world analog to an "SOS" pattern found on Refero — a single warning icon, one bold headline stating the consequence in plain language, one line of supporting text, a small usage-limit disclosure, and one full-width high-contrast red button as the only action. No competing UI. Exactly the level of restraint and clarity a craving-support screen needs: state what's about to happen, one button, done.
- Do not borrow: the red-alert/"blocking" framing and copy (a craving isn't a security breach — tone should be supportive, not alarming), the "3 times then contact us" limit mechanic.

### Unwind — Breathing session timer (full screen, in progress)
- Refero: https://refero.design/screens/cbf1baed-f2d5-4339-b709-7f2cf27cba7c
- App: Unwind (stress/sleep/breathwork)
- Borrow: countdown timer and a single large circular stop button are the only readable UI elements over a full-bleed calm scene; two small secondary icon buttons (sound/vibration) flank the stop button without competing with it. Text hierarchy is two lines max ("Focus on your breath" / "Starting in 5"). This is the right shape for a craving timer: one primary control, minimal chrome, session state always visible.
- Do not borrow: the illustrated night-farm scene and moon icon (too whimsical/decorative for a clinical taper app), the purple/lavender palette.

### Ahead — Minimal breathing cue screen
- Refero: https://refero.design/screens/6e3922f1-95df-4c86-9c52-a6f1230d3185
- App: Ahead (anger/mood management)
- Borrow: the most stripped-down version of the pattern — one animated circle, one short instruction line ("Breathe in"), a flat solid background, zero buttons visible. Useful as the "at rest" state of a craving timer, or as inspiration for how little chrome a calm full-screen moment actually needs.
- Do not borrow: the flat sky-blue fill (fine as a direction, but shouldn't be lifted verbatim since it's Ahead's signature color).

---

## Visual directions (styles)

Refero's style corpus is built from web marketing/product pages, not mobile app UI, so these are read for typography, contrast, and accent-color discipline rather than literal mobile layout.

- **Cron Calendar** — https://refero.design/styles/0528b40d-d5ef-4783-9206-d42fa97ad1d2 (cron.com). Near-black surfaces, bright white type, exactly one saturated accent (orange) reserved for the primary action only, flat high-contrast surfaces with no shadows. Closest match to "clean, typographic, one accent, high legibility" in dark mode.
- **The online bank (N26)** — https://refero.design/styles/59911817-9d14-445a-9f1b-617418001061 (n26.com). White/near-black text on white, one dominant teal used only for the primary CTA and hero blocking, thin borders instead of shadows, ledger-like precision. Best light-mode reference for "one accent, does all the work."
- **Sign in (imgs.so)** — https://refero.design/styles/b7df8424-4714-4bb8-a4e1-48760f76d909 (imgs.so). Extremely restrained: near-white canvas, black text, a single charcoal (not colored) primary button, 8px radius everywhere, tiny monospace tag as the only decorative flourish. Useful as a floor for "how little decoration is actually needed" — good gut-check against over-decorating the taper app.

---

## Cross-cutting observations

- **One accent, used sparingly, does all the signaling.** Every strong reference (Cron, N26, Google Maps' progress bar, Roots' red button) reserves color for exactly one thing — the primary action or the single most important number — and leaves everything else near-monochrome.
- **The hero number is typography, not illustration.** Mindllama, Foodvisor, and Imprint all make the streak/XP number the single largest element on screen with no competing icon-as-hero; decoration (flame, chart) supports the number rather than replacing it.
- **Progress is shown as a plain bar with numeric endpoints, not a game-style radial gauge or mascot.** Google Maps' level bar and Opal's per-badge progress bars both favor a thin horizontal fill with real numbers over anything skeuomorphic — this is what keeps gamification feeling adult.
- **Full-screen "focus" moments (timer, breathing) strip UI to one primary control plus at most two secondary icons.** No tab bar, no stats, nothing competing with the countdown and the one action a user needs mid-craving.
- **Locked states use a neutral lock glyph over a muted/blurred fill, never grayscale-only or a sad-face style empty state** — Opal and Imprint both hint at what's behind the lock (color glow, faint shape) rather than fully hiding it, which reads as motivating rather than punitive.
