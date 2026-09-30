---
name: quit
description: A warm nocturne. A black page, a grainy amber, ember and plum haze behind a huge white figure, and a single lit object, Envie.
colors:
  page: "#101012"
  surface: "#17171a"
  ink: "#f7f4ef"
  muted: "#a3a3a3"
  white: "#ffffff"
  line: "rgb(255 255 255 / 0.08)"
  ghost: "rgb(255 255 255 / 0.05)"
  ghost-line: "rgb(255 255 255 / 0.36)"
  alert: "#ff6b72"
  amber: "#b8730f"
  floor: "#3a1a10"
  floor-deep: "#1c1011"
  ember: "#8d2a1a"
  plum: "#7a1b5f"
  pink: "#fd429c"
  yellow: "#f5d907"
  moss: "#33402c"
  bronze: "#b88a4f"
  chart-low: "#ff7448"
  chart-high: "#ffc35d"
  transparent: "transparent"
  current-color: "currentColor"
typography:
  display:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "62cqi"
    fontWeight: 500
    lineHeight: 0.86
    letterSpacing: "-0.055em"
  countdown:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "33cqi"
    fontWeight: 500
    lineHeight: 0.86
    letterSpacing: "-0.05em"
  figure:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  prompt:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  craving:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  brand:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  cta:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    lineHeight: 1.4
  label:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    lineHeight: 1.3
  detail:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    lineHeight: 1.2
  unit:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.55em"
    lineHeight: 1
    letterSpacing: "0"
  tab:
    fontFamily: "Host Grotesk Variable, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1
rounded:
  hero: "1.75rem"
  card: "0.75rem"
  control: "0.625rem"
  step: "0.5rem"
  mark: "0.25rem"
spacing:
  gutter: "1.25rem"
  card-inset: "1.25rem"
  card-gap: "0.625rem"
  screen-gap: "1rem"
  hero-drop: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    typography: "{typography.cta}"
    rounded: "9999px"
    height: "2.75rem"
    padding: "0 1rem"
  button-primary-lg:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    rounded: "9999px"
    height: "3rem"
    padding: "0 1.25rem"
  button-secondary:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.ink}"
    typography: "{typography.cta}"
    rounded: "9999px"
    height: "2.75rem"
    padding: "0 1rem"
  button-secondary-active:
    backgroundColor: "{colors.ghost}"
  button-ghost:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.ink}"
    typography: "{typography.cta}"
    rounded: "9999px"
    height: "2.75rem"
    padding: "0 1rem"
  button-ghost-active:
    backgroundColor: "{colors.ghost}"
  button-destructive:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.alert}"
    typography: "{typography.cta}"
    rounded: "9999px"
    height: "2.75rem"
    padding: "0 1rem"
  button-disabled:
    backgroundColor: "{colors.ghost}"
    textColor: "{colors.muted}"
  craving-button:
    textColor: "{colors.page}"
    typography: "{typography.craving}"
    rounded: "9999px"
    height: "4rem"
    padding: "0 1.75rem"
  craving-button-disabled:
    backgroundColor: "{colors.ghost}"
    textColor: "{colors.muted}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.25rem"
  row-link:
    textColor: "{colors.ink}"
    typography: "{typography.cta}"
    height: "3.25rem"
  input:
    backgroundColor: "{colors.ghost}"
    textColor: "{colors.ink}"
    typography: "{typography.cta}"
    rounded: "{rounded.control}"
    height: "3rem"
    padding: "0 1rem"
  chip:
    backgroundColor: "{colors.ghost}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "9999px"
    height: "2.75rem"
    padding: "0 1rem"
  chip-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
  tabs-list:
    backgroundColor: "{colors.ghost}"
    textColor: "{colors.muted}"
    rounded: "9999px"
    height: "2.75rem"
    padding: "0.25rem"
  tabs-trigger-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    rounded: "9999px"
  switch-track:
    backgroundColor: "{colors.ghost-line}"
    rounded: "9999px"
    width: "51px"
    height: "31px"
  switch-track-checked:
    backgroundColor: "{colors.ink}"
  progress-track:
    backgroundColor: "{colors.line}"
    rounded: "9999px"
    height: "0.5rem"
  progress-fill:
    backgroundColor: "{colors.ink}"
    rounded: "9999px"
    height: "0.5rem"
  multiplier-step-acquired:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    rounded: "{rounded.step}"
    height: "2.625rem"
  multiplier-step-current:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.step}"
    height: "2.625rem"
  multiplier-step-locked:
    backgroundColor: "{colors.ghost}"
    textColor: "{colors.muted}"
    rounded: "{rounded.step}"
    height: "2.625rem"
  badge-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0.75rem"
  badge-card-locked:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.muted}"
    rounded: "{rounded.card}"
    padding: "0.75rem"
  tab-item:
    textColor: "{colors.muted}"
    typography: "{typography.tab}"
    rounded: "{rounded.control}"
    height: "3rem"
  tab-item-active:
    textColor: "{colors.ink}"
  chart-series:
    backgroundColor: "{colors.chart-low}"
    rounded: "{rounded.mark}"
    width: "1.5rem"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.25rem"
  drawer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hero}"
---

# Design System: quit

## Overview

**Creative North Star: « Nocturne chaude »** (a warm nocturne)

The app opened at night on a balcony, in place of a cigarette. A near-black page, a single warm,
grainy haze (amber, ember and plum over a brown floor) behind a huge white figure, and a single
lit object: the `Envie` pill, pink to yellow. Everything else stays back on dark cards, in cream
and gray. During a craving, the whole screen shifts into another material: a liquid moss and
bronze haze drifting slowly around a white countdown.

The world is drawn in code, with no images: the hazes are CSS gradients and an inline SVG
fractal noise, and the app icons are rendered from those same stops. It paints offline and from
the first frame. The hierarchy is deliberately uneven: a figure taking 62% of its column's width
rules the home screen, and everything else lives between 11 and 30 px. A data point is a figure,
never a gauge: the level is an 8 px bar, the multiplier a row of notches.

Confirmed anti-references: the bright wellness app (white canvas, pastels, green ring), the cold
neon-on-black tool, the flat navy world « Le relevé », « Grand air » (a sky of clouds), the
pinball machine (cartoon, saturated), the Instrument / Affiche / Registre variants, any material
metaphor (work jacket, stamped booklet, acetate manual).

**Key Characteristics:**
- A black page, a dark card, cream for text and for every selection
- A warm, grainy haze placed by rule: full on home, kept on first launch, a low band everywhere else
- A single lit object: `Envie` and its pink → yellow gradient, which nothing else carries
- A single typeface, Host Grotesk, tabular figures, small muted units
- No shadows, except the pink glow of `Envie`
- A single signature gesture: the ticking count-up, 240 ms; the haze drifts only under `motion-safe`

## Colors

A warm black and two structural grays, a cream that carries text and selection, a warm haze
family reserved for backgrounds, the charts' Braise gradient, and two named exceptions: the
`Envie` gradient and the alert red.

### Primary
- **Nocturne cream** (`ink`): all running text, and **every selection**: solid primary button,
  pressed chip and segment, active tab, checked `Switch`, progress bar fill, acquired multiplier notch,
  today's date in the calendar, focus ring, caret, text selection. On cream, text switches to
  `page`.
- **Pure white** (`white`): the key figures only (streak, countdown, minutes held), plus the
  timer's minute notches and the thumb of the `Switch` and the `Slider`. White is the light of
  the figure; text stays cream.

### Secondary
- **Envie pink** (`pink`) and **Envie yellow** (`yellow`): the two ends of `Envie`'s horizontal
  gradient, and its pink glow. They exist nowhere else.

### Tertiary
- **The home haze**: **Amber** (`amber`), **Ember** (`ember`) and **Plum** (`plum`) as three
  radial halos, laid on a **Floor** (`floor`) that falls to the **Deep floor** (`floor-deep`),
  then to `page`. These five values paint haze backgrounds only, never text, a border or a
  component.
- **The timer haze**: **Moss** (`moss`) and **Bronze** (`bronze`), as drifting blurred blobs.
  They belong to the craving timer screens only.

### Data
- **Braise** (`chart-low` → `chart-high`): the charts' own gradient, orange to gold, laid
  along the value axis and stretched over the whole scale, so only the tallest bars turn gold.
  It paints chart bars and nothing else, and never carries a glow.

### Neutral
- **Page** (`page`): the background of the whole app, text set on cream and on `Envie`, the
  overlay scrim (at 80%).
- **Surface** (`surface`): the card, the `Dialog`, the `Drawer`, the unlocked badge.
- **Muted gray** (`muted`): secondary text: card titles, row labels, tracks, units, axes,
  inactive tabs, placeholder, disabled button.
- **Hairline** (`line`, white 8%): structural separators: between the rows of a card, the
  `Dialog` border, the locked badge outline, the bar and slider track.
- **Veil** (`ghost`, white 5%): a control's resting background: field, chip, `Tabs` tray,
  locked notch, press feedback of the secondary and ghost buttons, disabled fill.
- **Control edge** (`ghost-line`, white 36%): the edge of everything touchable: secondary
  button, field, segmented tray, off `Switch` track, `Drawer` handle, link underline, chart
  baseline.
- **Alert** (`alert`): errors and destructive actions, nothing else.

### Measured contrast
- `muted`: 7.5:1 on `page`, 7.1:1 on `surface`.
- `alert`: 6.9:1 on `page`, 6.5:1 on `surface`, and much lighter than the haze's ember, so it is
  never mistaken for it.
- Braise: `chart-low` 6.7:1 on `surface`, 3.16:1 dimmed to 60 %, the chart floor;
  `chart-high` 11.3:1.
- `ghost-line`: 3.3:1, a control edge above 3:1 on the page as on a card
  (WCAG 1.4.11).
- The brand and the streak figure hold ≥ 3:1 (large text) on the lightest pixel of the haze: the
  amber sits between them, not beneath them.
- First-launch text holds ≥ 4.5:1 on the full haze: subtitles, progress indicator and unit
  switch to `ink` there (`muted` gray does not hold on the lightest pixel); the question, large
  text, holds ≥ 3:1.
- Timer text holds ≥ 6.4:1 at full drift; `brightestHazePixel` computes the lightest pixel a
  frame of the haze can paint (any combination of overlapping blobs, grain at maximum) and the
  test keeps ≥ 4.5:1 for both white and cream.

### Named Rules

**The Cream Selection Rule.** "Selected" is always a solid cream fill with `page` text,
everywhere: primary button, chip, segment, tab, `Switch`, today's date, acquired notch. No
accent color marks a selection.

**The One Lit Object Rule.** The pink → yellow gradient and its glow belong to `Envie` alone.
No other button, badge, chart or background borrows them, even in part.

**The Haze Is Ground Rule.** The haze colors (`amber`, `ember`, `plum`, `floor`,
`floor-deep`, `moss`, `bronze`) paint haze backgrounds only. They never color text, a control
or data.

**The Alert Is Not a Fill Rule.** `alert` writes error text (`text-alert`), borders an invalid
field, and draws the destructive button as a ghost pill with a hairline (1 px `alert` at 70%,
3.8:1, `alert` label, 10% on press). Never a tinted fill, never red on a lapse: a lapse is a
fact, not an error.

**The One Series Rule.** Charts have a single series, drawn in Braise (`chart-low` →
`chart-high`, SYR-91): 6.7:1 on the card at its low end, 3.16:1 dimmed. Never a second series,
a per-category hue, or `Envie`'s pink → yellow on a bar. Braise has no glow: `Envie` stays the
only lit object.

## Typography

**Single typeface:** Host Grotesk Variable (`--font-sans`), self-hosted through
`@fontsource-variable/host-grotesk` (`wght` axis), fallback `ui-sans-serif, system-ui,
-apple-system, sans-serif`. No separate display face, no mono.

**Character:** a soft, rarely seen grotesque, set tight at large sizes (negative tracking that
grows with size) and left neutral in text. `font-variant-numeric:
tabular-nums` is set on `body`: a changing figure never makes the line jump.
Figures at 500, interface at 400 / 500, 600 only for the brand and `Envie`.

### Hierarchy
- **display** (500, 62cqi, 0.86, -0.055em): the streak figure, and the minutes held at the end
  of a timer. Proportional to its column.
- **countdown** (500, 33cqi, 0.86, -0.05em): the timer's `m:ss` countdown.
- **figure** (500, 1.875rem / 30 px, 1, -0.035em): the figures on cards: totals, money,
  application time, statistics.
- **headline** (500, 1.75rem / 28 px, 1.1, -0.03em): the first-launch question, one per
  screen.
- **prompt** (400, 1.5rem / 24 px, 1.2, -0.025em): the running timer's sentence (« Respire… »),
  15 characters wide at most.
- **craving** (600, 1rem / 16 px, 1, -0.02em): the `Envie` label; the size of `cta`, at 600.
- **brand** (600, 1.3125rem / 21 px, 1, -0.03em): « quit » in the top bar, on every
  screen.
- **title** (500, 1.25rem / 20 px, 1.2, -0.02em): the title of a screen below home, the
  `Dialog` and `Drawer` title, a status set as a title inside a card.
- **lead** (400, 1.125rem / 18 px, 1.3, -0.01em): the line under a giant figure (« jours de
  streak · 07 h 42 »).
- **cta** (500, 1rem / 16 px, 1, -0.02em): buttons, field values, list rows.
- **body** (400, 0.9375rem / 15 px, 1.4): reading text, row labels, screen subtitles,
  chips.
- **label** (400, 0.8125rem / 13 px, 1.3): card titles, field labels, errors, chart
  readout.
- **detail** (400, 0.75rem / 12 px, 1.2): axes, dose labels, badge detail.
- **tab** (500, 0.6875rem / 11 px, 1): tab bar labels.
- **unit** (0.55em, 1, tracking 0): a figure's unit, relative to the figure it follows.

### Named Rules

**The Share-of-Column Rule.** The giant figures (`display`, `countdown`) are in `cqi`: their
parent is an `@container` with no padding, so the share is computed over the whole column. The
streak keeps 62cqi up to two digits, then `streakFigureSize` shrinks it
(`min(62, floor(144 / digits))cqi`) so it never runs past the gutters.

**The Small Muted Unit Rule.** A unit (`€`, `%`, `j`, `h`, `min`, after a non-breaking
space) is set smaller and muted behind its figure: `Figure` splits the string
(`splitUnits`) and dresses the unit in `unit` + `muted`. The string stays a single sentence for
the screen reader and a single entry in the strings module.

**The cn() Registration Rule.** Every `@theme` size and radius is declared in
`src/shared/utils/cn.ts`; otherwise tailwind-merge reads `text-tab` as a color and drops it
next to a `text-<color>`. `cn.test.ts` fails if a token is missing.

## Layout

A single centered column, `max-w-md` (448 px), designed for an iPhone 16 Pro as a standalone
PWA (402 px), then simply centered beyond that. The hazes, however, spread across the full
width behind the column.

- **Gutters:** `px-safe`, i.e. `max(1.25rem, env(safe-area-inset-*))`. `pt-safe` at the top;
  `pb-page` at the bottom of screens (home indicator + sandbox marker), `pb-safe-4`
  under an action in the thumb zone.
- **Top bar:** 56 px minimum (`min-h-14`, `pt-2`), brand on the left, context and a 44 px
  control on the right; the control's glyph overhangs into the gutter (`-mr-2.5`) to line up.
- **Home:** haze over the top 640 px; the figure starts 64 px below the top bar;
  the cards start 64 px below the `lead` line, 12 px from the edges (`px-3`, wider
  than the text gutter), 10 px apart.
- **Screens below home (`AppShell`):** screen height (`min-h-svh`), a stack at 16 px
  intervals: top bar, `PageHeader`, content. A form screen (`FormScreen`) or a first-launch
  step keeps its action at the bottom (`ThumbZone`, `mt-auto`), in the thumb zone; « Annuler »,
  « Retour » or « Supprimer » follow below it. Taller than the screen, the column scrolls and the
  action comes last.
- **Touch targets:** 44 px minimum (`h-11`, `size-11`); 48 px for a field, an `lg`
  button, a tab item; 52 px for a list row.

### Named Rules

**The Fixed Pill Rule.** `Envie` is fixed at the bottom right, over a fade to `page` at 92%,
on every screen that is neither a form nor the timer: home, calendar, statistics, history,
settings. Scrolling content reserves bottom clearance (`pb-32` on home, `pb-page` elsewhere,
which grows while the pill is mounted) so no information stays under the pill or its fade.

**The Thumb Zone Rule.** The main action of a decision screen (first-launch question,
`Arrêter`, `Enregistrer` on a craving) lives at the bottom of the screen, over a fade to the
page when it sticks (`ThumbZone sticky`, offset by `--page-clearance` above the bottom edge).

## Elevation & Depth

No drop shadows: there is no `--shadow-*` token. Depth comes from the haze, the `surface` fill
on `page`, the hairlines and the veil. The only `box-shadow` in the world is `Envie`'s glow
(in the `bg-craving` utility), which makes it the lit object.

1. **The haze**: radial halos over a floor, faded into the page by a mask
   (`mask-haze`: opaque up to 65%, then transparent) so halos and grain die out
   together, with no visible edge.
2. **The grain**: inline SVG fractal noise (`bg-grain`) in `mix-blend-overlay`, 35%
   on the home haze, 20% on the timer's. It is the only grain in the world.
3. **The card**: `surface` on `page`, no border.
4. **The hairline**: 1 px `line` to separate, 1 px `ghost-line` to edge what is touchable.
5. **The scrim**: `page` at 80% under the `Dialog` and the `Drawer`.
6. **The fades**: to `page` under `Envie`, under a sticky action, at the bottom of a timer
   haze (96 px).

### Shadow Vocabulary
- **Envie glow** (`box-shadow: 0 14px 40px -10px color-mix(in srgb, #fd429c 60%, transparent),
  inset 0 0 0 1px rgb(255 255 255 / 0.12)`): `Envie` alone.

### Named Rules

**The Haze Placement Rule.** The haze never goes out, but its dose is set per screen:
- **Home**: the full haze (`HeroHaze` `hero`), 640 px, behind the brand and the streak.
- **First launch**: the same full haze (`hero`), the world's first impression. Secondary
  text set on it switches to `ink` to hold 4.5:1.
- **All other screens**: the low band (`band`): 192 px, 70%, plum and ember only,
  **no amber under text**, on a `floor-deep` floor, behind the top bar
  and the title.
- **Craving timer**: its own liquid moss and bronze haze, full screen.
- **Timer stopped early**: the same haze, at 60% and still: never switched off, never
  flagged.

**The Code-Drawn Rule.** Hazes, grain and icons are code: no decorative raster. The
icons in `public/` are rendered by `scripts/render-icons.mjs` from the `bg-haze` stops and
a white Host Grotesk "q"; each PNG carries its provenance in a `tEXt` chunk. Changing a
haze stop or the typeface → rerun the script.

**The Focus Outline Rule.** Focus is an `outline: 2px solid ink`, `outline-offset: 3px`,
set globally on `:focus-visible`. No component draws its own ring.

## Shapes

Everything touchable is a pill; everything that contains is a soft rectangle.

| Token | Value | Where |
|---|---|---|
| `rounded-full` | pill | all buttons, `Envie`, chips, `Tabs` tray and tabs, segmented tray, `Switch`, progress bar, minute notches, settings control |
| `rounded-hero` | 1.75rem / 28 px | the `Drawer`'s opening edge |
| `rounded-card` | 0.75rem / 12 px | card, badge, `Dialog` |
| `rounded-control` | 0.625rem / 10 px | text field, tab bar item |
| `rounded-step` | 0.5rem / 8 px | multiplier notches |
| `rounded-mark` | 0.25rem / 4 px | the data end of a chart bar, never the base end |

Outlines are always 1 px (2 px only around the slider thumb, in `page`, and on the
calendar's « à poser » ring). The perfect
square exists only once: the badge (`aspect-square`).

## Components

### Top bar (`TopBar`)
A single bar on every screen: « quit » in `brand` on the left; on the right, in `body`, the
context (« Étape 2 · 14 mg », « Minuteur d'envie »), then a 44 px icon control
(settings, 1.5 stroke, `ghost` on press).

### Screen header and back (`PageHeader`, `BackLink`)
Every screen below home opens the same way: the left chevron (44 px `ghost` `icon` button,
1.75 stroke, pulled 12 px into the gutter) **next to** the title in `title`, then an optional
subtitle in `body` `muted`. It is the only way back up. A form closes with a `ghost`
« Annuler » button under its action, never with a second chevron.

### Cards / Containers (`Card`)
- **A single card:** `surface`, `rounded-card` (12 px), no border, no shadow.
- **Padding:** `block` 20 px on every side (the only one); `rows` 20 px on the sides, the
  rows bring their own height; `none` when the content handles its own inset (grid, calendar).
- **Title:** a titled card is a region; its title is its `h2` (home) or `h3` (below a
  screen title), in `label` `muted` at the top, with an optional aside opposite; 14 px between
  it and the content. Without a title, `label` provides the accessible name.
- **Figure rows (`FigureRows`):** `body` `muted` label on the left, `figure` on the
  right with its small units, `line` hairline between rows, 12 px above and below.
- **Statistics summary:** a 2 × 2 grid as a `dl`, `label` `muted` label above the
  `figure`, cells separated by hairlines.

### Buttons
Calm, pill-shaped, `cta` 500, no shadow.
- **Sizes:** `default` 44 px / `sm` 36 px (`label`) / `lg` 48 px / `icon` 44 × 44 /
  `icon-sm` 36 × 36.
- **Primary:** solid cream, `page` text; press → cream at 85%.
- **Secondary:** ghost pill, 1 px `ghost-line` hairline, cream text; press → `ghost`.
- **Ghost:** transparent, cream text; press → `ghost`. Used for « Annuler » and back.
- **Destructive:** ghost pill with a 70% `alert` hairline (3.8:1), `alert` label; press → `alert` 10%.
  Placed in a confirmation `Dialog` or below a hairline, never right next to « Enregistrer ».
- **Link:** cream `body` text underlined in `ghost-line` (4 px offset), 44 px target kept.
- **Disabled:** `ghost` fill, `muted` text, border removed.
- **Press feedback:** `scale(0.98)` over 150 ms `ease-out-expo`, frozen under `motion-reduce`. No
  dedicated `hover` state: the target is a finger.

### Envie (signature)
The permanent pill, the only lit object: 64 px high, hugging its label (64 px wide at least), a
horizontal `pink` → `yellow` gradient, `craving` label in `page`, pink glow. Fixed at the bottom
right over its fade, outside forms and the timer. Sinks to `scale(0.97)`. Disabled, it loses
gradient and glow: `ghost` fill, `muted` text.

### Chips and segmented control
- **Chip (`Toggle`, `ToggleGroup`):** 44 px `ghost` pill, cream `body` text; pressed →
  solid cream, `page` text. `outline` variant: `ghost-line` hairline, pressed edged in cream.
- **Segmented:** `ToggleGroup` with `spacing={0}` + `variant="outline"`: a pill tray with a
  `ghost-line` hairline, 4 px inset, equal 44 px segments; the pressed segment is
  a cream pill inside the tray.

### Inputs / Fields
- **Field:** 48 px, `rounded-control`, `ghost` background, 1 px `ghost-line` hairline, 16 px inset,
  cream value in tabular `cta` 500, `muted` 400 placeholder. Invalid → `alert` hairline, and a
  `<p role="alert">` in `label` `alert` under the field. Native dates are left-aligned.
- **Switch:** 51 × 31 track; off `ghost-line`, 27 px white thumb; on cream, `page` thumb,
  20 px travel in 150 ms.
- **Slider:** 8 px `line` track, cream fill, 28 px white thumb ringed 2 px in `page`,
  `scale(1.1)` on press, touch area widened by 8 px.
- **Tabs:** 44 px `ghost` pill tray, 4 px inset, `muted` text; active tab as a
  cream pill, `page` text. `line` variant: bottom `line` hairline, active in cream with a 2 px underline.

### Navigation
- **Row list (current):** on home, a `rows` card of `RowLink` carries the
  navigation: each row 52 px, cream `cta` 400 label, 18 px `muted` right chevron at the end,
  `line` hairline between rows; press → `muted` text.
- **Tab bar (with M2):** its look is fixed in `src/shared/ui/TabBar.tsx` and it arrives
  with Progression: `page` background, top `line` hairline bounded to the column, four items (Accueil ·
  Calendrier · Progression · Historique), 24 px icon over a `tab` label, 48 px item. Active →
  cream, with no background or indicator; inactive → `muted`, cream on press. `aria-current="page"`.

### Streak hero (signature)
On the full haze: the top bar, then a centered column: the streak figure in white
`display`, then a single `lead` line: « jours de streak », a drawn dot (not read aloud),
and the `hh h mm` clock in `muted`. The real figure is read through `sr-only`; the animated value is
`aria-hidden`.

### Craving timer (signature)
- **Running:** full screen on the liquid haze: two bronze blobs, one moss, one `page`
  blob, blurred 48 px, drifting back and forth over 14 to 22 s; the whole layer at 65%,
  grain at 20%. Top bar with « Minuteur d'envie ». In the center, left-aligned: the sentence in
  `prompt`, the countdown in white `countdown` (`role="timer"`), « Temps restant » in
  `label`, then a row of minute notches across the whole column (4 px, pill, 6 px gap:
  held white, current white 45%, upcoming white 22%). `Arrêter` as a full-width `secondary` `lg`,
  in the thumb zone. Only the seconds and the haze move.
- **Held to the end:** the same haze at the top of the screen, faded to the page over 96 px; the
  minutes held count up in white `display`, the notches enter in sequence: the app's
  celebration. Below, the intensity and the tags.
- **Stopped early:** the haze stays, at 60% and still; title and subtitle, then the same
  form. No celebration, no reproach.

### Progress
- **Bar (`ProgressBar`):** 8 px `line` track, cream fill, width animated over 500 ms. The
  numeric bounds live beside it: the bar never carries text.
- **Multiplier:** five 42 px notches, `rounded-step`, 1 px hairline: acquired → solid cream,
  `page` text; current → ringed in cream, transparent background, cream text; locked → `ghost`,
  `muted` text. They enter in sequence, 60 ms apart (`step-in`).

### Badges
Square, `rounded-card`, 12 px inset, name in `body` 500 and detail in `detail`. Unlocked →
`surface`, cream text, `muted` detail, no icon. Locked → 1 px `line` outline with no background,
`muted` text, 24 px padlock (1.75 stroke) at the top; « à débloquer » in `sr-only`.

### Calendar
Month grid on a card surface, month in `title` and two 44 px arrows; date in tabular `label` inside a 24 px disc; today
is the only cream disc (`page` text); upcoming days in `muted`, days outside the calendar in
`muted` 80%. 14 px marks under the date, one shape per state: patch applied = cream dot,
missed = `muted` dash, due = cream ring, planned = small `muted` dot; lapse = cigarette,
craving = timer. First day of a step: a `ghost` pill in `detail`.

### Charts
On a card, a single series in Braise, spanning the whole scale. Columns 24 px wide at most,
2 px apart, `rounded-mark` at the data end, sitting on a `ghost-line` baseline; horizontal bars
8 px thick, same rule, baseline on the left. A step change = a 1 px `muted` hairline across the full
height, dose in cream `detail` above it. Axes in `detail` `muted`. A readout line in
`label` names one column (name in cream 500); a sliding finger picks another and the others
drop to 60% (3.16:1 against the card at the low end, never below 3:1). Every chart has its `table` twin in
`sr-only` (as `block`, so it never widens the page).

### Overlays
- **Dialog:** `surface` card, `rounded-card`, `line` hairline, 20 px inset, `max-w-sm` width,
  over a `page` 80% scrim; title in `title`, description in `body` `muted`. Enter / exit:
  opacity + `scale(0.95)`, 200 ms.
- **Drawer:** `surface` sheet, `rounded-hero` on the opening edge, `page` 80% scrim,
  4 × 96 px `ghost-line` handle. The Base UI mechanics are untouched (450 ms curves).

### Motion
A single signature: **the ticking count-up** (`countUpAt`). A figure climbs in whole ticks,
12 at most, over 240 ms: a wheel settling into place, never a smooth interpolation. On home,
it plays once per launch (`useLaunchEntrance`): days and clock climb together and land
on the same tick. `--ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`) for everything; 150 ms for
press feedback, 200 ms for a dialog, 240 ms for the signature and `step-in`, 500 ms for
a bar.

**The Reduced Motion Rule.** Under `prefers-reduced-motion: reduce`, counters show the
final value from the first frame; the haze drift, `step-in` and the notch sequence
play only under `motion-safe:`, so the haze becomes a still image; every transition carries
`motion-reduce:transition-none`.

## Do's and Don'ts

### Do:
- **Do** mark every selection with a solid cream fill and `page` text.
- **Do** place the haze per The Haze Placement Rule: full on home and on first launch (secondary text in `ink` over it), a low band with no amber everywhere else, a moss and bronze haze on the timer, still and dimmed once it is stopped.
- **Do** build every block on the single card: `surface`, 12 px radius, 20 px inset.
- **Do** open every viewing screen below home (calendar, statistics, history, settings, protocol) with the top bar then `PageHeader` (chevron next to the title); a form has no chevron and closes with a `ghost` « Annuler » (a fact's detail sheet, with a `ghost` « Retour »).
- **Do** set a figure's units small and muted through `Figure`.
- **Do** edge every control in `ghost-line` (≥ 3:1) and separate structure with `line`.
- **Do** write errors in `alert` under their field, and draw destructive actions as a ghost pill with an `alert` hairline.
- **Do** check every text set on a haze: ≥ 3:1 for the brand and the figure, ≥ 4.5:1 for running text.
- **Do** declare every new `@theme` size or radius in `src/shared/utils/cn.ts`.
- **Do** keep every animation behind `motion-safe:` or `motion-reduce:transition-none`, and render a counter's final value under reduced motion.
- **Do** rerun `npm run icons` (`scripts/render-icons.mjs`) after any change to a haze stop or the typeface.

### Don't:
- **Don't** lend the pink → yellow gradient or `Envie`'s glow to any other object.
- **Don't** paint text, a control or data with a haze color.
- **Don't** put amber under text outside home: the low band is plum and ember only.
- **Don't** switch off a screen's haze, nor the stopped timer's.
- **Don't** add a drop shadow, a `ring-*` or a per-component focus ring: the only `box-shadow` is `Envie`'s glow, and focus is the global `outline`.
- **Don't** give a destructive button a tinted fill, nor color a lapse in `alert`.
- **Don't** color a chart bar outside Braise (amber, an accent, a second series, `Envie`'s gradient).
- **Don't** turn progress into a ring or a gauge: an 8 px bar with its numeric bounds, or a row of notches.
- **Don't** add a decorative raster: hazes, grain and icons are code.
- **Don't** create a second top bar, a second card or a second back gesture.
- **Don't** animate a figure with smooth interpolation: in ticks, 240 ms, `ease-out-expo`.
