---
version: 1
slug: "src-routes-design-tsx"
primary_target: "src/routes/design.tsx"
related_targets: ["src/routes/index.tsx","src/routes/craving/timer.tsx"]
---

# Surface brief — /design (design foundations specimen)

Scope: hidden route `/design`, a living specimen of the visual world. No feature screen, no domain logic. All figures are synthetic and labelled as such.
Visitor mode: Operate. Audience: the single user and the agents building later UI tickets; it is the reference every screen inherits from. Home (`/`) and the craving timer are the two surfaces the visual target shows.
Must show: tokens, type, buttons and states, streak, level bar, streak multiplier, badges (locked / unlocked), bottom tab bar (Accueil · Calendrier · Progression · Historique), the permanent Envie control, the hero haze, and the reskinned shadcn pieces (Drawer, Dialog, Switch, Tabs, Slider, segmented ToggleGroup).
Constraints: look-only redesign (IA, UX, copy and behaviour unchanged); French UI strings, `CONTEXT.md` vocabulary, iPhone standalone PWA, one-hand reach, legible outdoors at night and in daylight, open-source self-hosted fonts, reduced-motion support.
Agreed screen inventory: home, calendar, progress (stats inside), fact history, settings (icon from home). Craving timer is a permanent thumb control outside the tabs.
Visual target: `docs/design/mocks/nocturne-chaude.html` (home + craving timer, demo data; published at https://claude.ai/artifact/AgLBg9A9qtCYi7zJjC1nTC).
Rejected worlds (evidence, anti-reference): the navy flat world "Le relevé" (functional, not striking); "Grand air" (Air-based cloud sky, two mocks); pinball machine (cartoon, saturated, over-ornamented); prototype variants Instrument / Affiche / Registre (cold, AI-looking); material metaphors (work jacket, stamped passbook, acetate manual).
User-provided asset pending: the hero background image — warm grainy haze in amber, ember and plum, portrait, bottom fading into the page colour, no literal smoke or embers. The code haze is its placeholder and its floor.
Unresolved: the destructive/error colour (must clear 4.5:1 on the card surface and stay distinct from the haze's ember); tab bar, badges, charts, Dialog and Drawer in this world (not in the target, derive from the system).

## Direction contract

THESIS: A warm nocturne — the app opened at night on a balcony instead of a cigarette. Pitch-black page, one grainy warm haze behind a huge white figure, and a single lit object: Envie. Refuses the bright wellness app (white canvas, pastel, green ring) and the cold neon-on-black tool.

OWN-WORLD: Page #101012, cards #17171a radius 12, text #f7f4ef, key figure #ffffff, muted #a3a3a3, hairlines white 8 %. Hero haze: radial amber #b8730f, ember #8d2a1a, plum #7a1b5f over #3a1a10 fading to the page, fractal-noise grain in overlay. Primary = #f7f4ef filled pill, text #101012. Pink #fd429c → yellow #f5d907 gradient belongs to Envie alone, label #101012, pink glow. Chips = white-5 % pills, selected = cream fill. Secondary = ghost pill, 1px white 30 %. Progress = cream on white 8 %. Craving timer only: blurred liquid moss #33402c and bronze #b88a4f drifting over the page. Type: Host Grotesk; figures weight 500, tracking −0.055em, tabular; UI 400/500.

STORY: The user sees the streak glowing out of the haze, reads what is acquired and saved on dark cards, logs the patch with one cream pill, and finds Envie under the right thumb without looking. Mid-craving, the screen turns to slow moss and bronze around a white countdown.

FIRST VIEWPORT: Haze fills the top 640px and fades into #101012. Top bar: "quit" 21px/600 left; "Étape 2 · 14 mg" 14px and 44px settings control right. Streak centred, ≈62cqi (≈250px at 402), white, weight 500; "jours de streak · 07 h 42" 18px under it, hours muted. Cards start 64px lower, 10px apart. Envie: 64px gradient pill, right-aligned, 62 % wide, over a bottom fade to the page.

FORM: User-pinned after a Refero exploration of three directions ("Grand air" mocked twice and rejected). Primary Refero style Suno (9844e7bf), secondary monopo saigon (76c30104) for the timer haze and ghost pills only. concept-seed key d9995448 rolled; the pinned direction overrides its assignment. Code-led (no image generation). Signature interaction: the stepped 240ms streak count-up stays; the timer haze drifts under motion-safe only.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
