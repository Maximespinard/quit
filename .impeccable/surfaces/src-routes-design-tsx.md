---
version: 1
slug: "src-routes-design-tsx"
primary_target: "src/routes/design.tsx"
related_targets: []
---

# Surface brief — /design (design foundations specimen)

Scope: hidden route `/design`, a living specimen of the visual world for SYR-17. No feature screen, no domain logic. All figures are synthetic and labelled as such.
Visitor mode: Operate. Audience: the single user and the agents building later UI tickets; it is the reference every M1/M2 screen inherits from.
Must show: tokens, type, buttons and states, streak, level bar, streak multiplier, badges (locked / unlocked), bottom tab bar (Accueil · Calendrier · Progression · Historique), the permanent Envie control, and the reskinned shadcn pieces (Drawer, Dialog, Switch, Tabs, Slider, segmented ToggleGroup).
Constraints: French UI strings, `CONTEXT.md` vocabulary, iPhone standalone PWA, one-hand reach, daylight legibility, open-source self-hosted fonts, reduced-motion support.
Agreed screen inventory: home, calendar, progress (stats inside), fact history, settings (icon from home). Craving timer is a permanent thumb control outside the tabs.
Rejected worlds (evidence, anti-reference): pinball machine (cartoon, saturated, over-ornamented); earlier prototype variants Instrument / Affiche / Registre (cold, AI-looking); material metaphors (work jacket, stamped passbook, acetate manual) declined as "skins".
References: `docs/design/references.md` (Refero: Cron, N26, Google Maps level bar, Opal / Imprint badges, Unwind timer) — borrowed for layout, hierarchy and density only, never colour or brand.

## Direction contract

THESIS: A flat, typographic product UI — the category standard executed at full craft. One deep navy family carries every fact; the page is white; nothing is textured, textured, hatched or grained. Refuses the health-green progress ring on white and refuses every material metaphor.

OWN-WORLD: Page white #fafafa. Navy #1b3c53 owns the hero block (bottom corners rounded 28px) and every "acquired" state; #234c6a is the action and progress colour (Envie pill, XP fill, active tab); steel #456882 marks "current" (the reached multiplier step). Surfaces #e3e3e3 for cards, #d4d4d4 for locked, hairlines #d4d4d4, muted text #4a5a66 (darkened from #5e6c78 so locked-badge copy clears 4.5:1). One family: Bricolage Grotesque variable (opsz 12–96, wght 400/500/600/800), tabular numerals, tracking -0.02em on display. Radii: 28px hero, 14px cards, 10px steps, pill for Envie. No shadows: depth is colour and hairline only. One warm value, alert red #a6392f, is the single approved exception to the navy-and-grey family: it belongs to destructive actions and errors and to nothing else (user decision, this build).

STORY: The user sees the streak as the one huge figure on a navy block, reads under it how long until the next multiplier step and level, sees which badges are earned and which are locked, and reaches Envie with the right thumb without looking.

FIRST VIEWPORT: Navy hero block from the top edge to under "jours sans fumer · 07 h 42": "quit" top-left, "Étape 1 · 21 mg · J-16 avant 14 mg" top-right, streak days at 176px weight 800 left-aligned, then the label row. On white below, in this order with 20px gaps: multiplier as five 42px steps (acquired navy, current steel, locked outline), level as an 8px bar with numeric endpoints, badges as a 3-column grid of square cards (locked = #d4d4d4 + lock glyph). Envie is a 64px-high pill, right thumb side, above the tab bar. Tab bar: four items, icon + label, active #234c6a.

FORM: Category canon, chosen by the user after two rounds of coded studies (seed key f96838ca declined in full; textile / passbook / acetate hand rejected; Bloc composition + ColorHunt 1b3c53-234c6a-456882-e3e3e3 palette locked as study "acier", `.impeccable/mocks/studies-3/acier.html`). Signature interaction: the streak figure counts up digit-wise on load and the multiplier steps fill in sequence, 240ms exponential ease-out, stepped not floaty; reduced motion shows the final state.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
