---
name: quit
description: Une nocturne chaude — une page noire, une brume grainée ambre, ember et prune derrière un immense chiffre blanc, et un seul objet allumé, Envie.
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
  series: "#d08a2a"
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
    fontSize: "1.4375rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
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
    width: "62.5%"
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
    backgroundColor: "{colors.series}"
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

**Creative North Star : « Nocturne chaude »**

L'app ouverte la nuit sur un balcon, à la place d'une cigarette. Une page presque noire, une
seule brume chaude et grainée — ambre, ember, prune sur un plancher brun — derrière un immense
chiffre blanc, et un seul objet allumé : la pilule `Envie`, rose vers jaune. Tout le reste se
tient en retrait sur des cartes sombres, en crème et en gris. Pendant une envie, l'écran entier
bascule dans une autre matière : une brume liquide mousse et bronze qui dérive lentement autour
d'un compte à rebours blanc.

Le monde est dessiné en code, sans image : les brumes sont des dégradés CSS et un bruit
fractal SVG en ligne, les icônes de l'app sont rendues depuis ces mêmes stops. Il peint hors
ligne et dès la première image. La hiérarchie est volontairement inégale : un chiffre qui prend
62 % de la largeur de sa colonne règne sur l'accueil, tout le reste vit entre 11 et 30 px. Une
donnée est un chiffre, jamais une jauge : le niveau est une barre de 8 px, le multiplicateur une
rangée de crans.

Anti-références confirmées : l'app bien-être lumineuse (toile blanche, pastels, anneau vert),
l'outil néon froid sur noir, le monde marine plat « Le relevé », « Grand air » (ciel de nuages),
le flipper (cartoon, saturé), les variantes Instrument / Affiche / Registre, toute métaphore
matérielle (veste de travail, livret tamponné, manuel en acétate).

**Key Characteristics :**
- Une page noire, une carte sombre, du crème pour le texte et pour toute sélection
- Une brume chaude grainée, placée par règle : pleine sur l'accueil, retenue au premier lancement, en bande basse partout ailleurs
- Un seul objet allumé : `Envie` et son dégradé rose → jaune, que rien d'autre ne porte
- Une seule police, Host Grotesk, chiffres tabulaires, unités petites et sourdes
- Aucune ombre, sauf la lueur rose d'`Envie`
- Un seul geste signature : le compteur par crans, 240 ms ; la brume ne dérive que sous `motion-safe`

## Colors

Un noir chaud et deux gris de structure, un crème qui porte le texte et la sélection, une
famille de brume chaude réservée aux fonds, et deux exceptions nommées : le dégradé d'`Envie`
et le rouge d'alerte.

### Primary
- **Crème nocturne** (`ink`) : tout le texte courant, et **toute sélection** — bouton primaire
  en aplat, puce et segment pressés, onglet actif, `Switch` coché, remplissage de barre, cran
  de multiplicateur acquis, date du jour au calendrier, anneau de focus, caret, sélection de
  texte. Sur le crème, le texte passe en `page`.
- **Blanc pur** (`white`) : les chiffres-clés seuls — streak, compte à rebours, minutes tenues —
  et les crans de minute du minuteur, le pouce du `Switch` et du `Slider`. Le blanc est la
  lumière du chiffre ; le texte, lui, reste crème.

### Secondary
- **Rose Envie** (`pink`) et **Jaune Envie** (`yellow`) : les deux bouts du dégradé horizontal
  d'`Envie`, et sa lueur rose. Ils n'existent nulle part ailleurs.

### Tertiary
- **La brume d'accueil** : **Ambre** (`amber`), **Ember** (`ember`) et **Prune** (`plum`) en
  trois halos radiaux, posés sur un **Plancher** (`floor`) qui descend vers le **Plancher
  profond** (`floor-deep`) puis vers la `page`. Ces cinq valeurs ne peignent que des fonds de
  brume — jamais un texte, une bordure ou un composant.
- **La brume du minuteur** : **Mousse** (`moss`) et **Bronze** (`bronze`), en taches floues qui
  dérivent. Elles n'appartiennent qu'aux écrans du minuteur d'envie.
- **Ambre de série** (`series`) : la seule couleur de donnée des graphiques. Une série = une
  teinte.

### Neutral
- **Page** (`page`) : le fond de toute l'app, le texte posé sur le crème et sur `Envie`, le voile
  des overlays (à 80 %).
- **Surface** (`surface`) : la carte, le `Dialog`, le `Drawer`, le badge débloqué.
- **Gris sourd** (`muted`) : texte secondaire — titres de carte, libellés de ligne, pistes,
  unités, axes, onglets inactifs, placeholder, bouton désactivé.
- **Filet** (`line`, blanc 8 %) : les séparateurs de structure — entre lignes d'une carte, bord
  du `Dialog`, contour du badge verrouillé, piste de barre et de slider.
- **Voile** (`ghost`, blanc 5 %) : le fond d'un contrôle au repos — champ, puce, plateau de
  `Tabs`, cran verrouillé, retour tactile des boutons secondaire et fantôme, aplat désactivé.
- **Bord de contrôle** (`ghost-line`, blanc 36 %) : le bord de tout ce qui se touche — bouton
  secondaire, champ, plateau segmenté, piste de `Switch` éteint, poignée de `Drawer`, soulignement
  du lien, ligne de base des graphiques.
- **Alerte** (`alert`) : erreurs et destructif, rien d'autre.

### Contrastes mesurés
- `muted` : 7,5:1 sur `page`, 7,1:1 sur `surface`.
- `alert` : 6,9:1 sur `page`, 6,5:1 sur `surface` — et bien plus clair que l'ember de la brume,
  donc jamais confondu avec elle.
- `ghost-line` : 3,3:1, bord de contrôle au-dessus de 3:1 sur la page comme sur une carte
  (WCAG 1.4.11).
- La marque et le chiffre du streak tiennent ≥ 3:1 (grand texte) sur le pixel le plus clair de
  la brume : l'ambre est placé entre les deux, pas sous eux.
- Le texte du premier lancement tient ≥ 4,5:1 sur la brume pleine : sous-titres, étape et unité y
  passent en `ink` (le gris `muted` n'y tient pas au pixel le plus clair) ; la question, grand texte,
  tient ≥ 3:1.
- Le texte du minuteur tient ≥ 6,4:1 en pleine dérive ; `brightestHazePixel` calcule le pixel le
  plus clair qu'une image de la brume puisse peindre (toute combinaison de taches superposées,
  grain au maximum) et le test garde ≥ 4,5:1 pour le blanc comme pour le crème.

### Named Rules

**The Cream Selection Rule.** « Sélectionné » est toujours un aplat crème avec un texte `page`,
partout : bouton primaire, puce, segment, onglet, `Switch`, date du jour, cran acquis. Aucune
couleur d'accent ne marque une sélection.

**The One Lit Object Rule.** Le dégradé rose → jaune et sa lueur appartiennent à `Envie` seul.
Aucun autre bouton, badge, graphique ou fond ne les emprunte, même en partie.

**The Haze Is Ground Rule.** Les couleurs de brume (`amber`, `ember`, `plum`, `floor`,
`floor-deep`, `moss`, `bronze`) ne peignent que des fonds de brume. Elles ne colorent jamais un
texte, un contrôle ou une donnée.

**The Alert Is Not a Fill Rule.** `alert` écrit un texte d'erreur (`text-alert`), borde un champ
invalide, et dessine le bouton destructif en pilule fantôme à filet (1 px `alert` à 50 %,
libellé `alert`, appui à 10 %). Jamais d'aplat teinté, jamais de rouge sur un écart : un écart
est un fait, pas une erreur.

**The One Series Rule.** Les graphiques n'ont qu'une teinte, `series`. L'ambre de série ne
partage jamais un écran avec le bronze du minuteur.

## Typography

**Police unique :** Host Grotesk Variable (`--font-sans`), auto-hébergée via
`@fontsource-variable/host-grotesk` (axe `wght`), repli `ui-sans-serif, system-ui,
-apple-system, sans-serif`. Pas de police display séparée, pas de mono.

**Character :** un grotesque doux et peu vu, tenu serré dans les grands corps (tracking
négatif croissant avec la taille) et laissé neutre dans le texte. `font-variant-numeric:
tabular-nums` est posé sur `body` : un chiffre qui change ne fait jamais danser la ligne.
Chiffres en 500, interface en 400 / 500, 600 seulement pour la marque et `Envie`.

### Hierarchy
- **display** (500, 62cqi, 0,86, -0,055em) : le chiffre du streak, et les minutes tenues à la
  fin d'un minuteur. Proportionnel à sa colonne.
- **countdown** (500, 33cqi, 0,86, -0,05em) : le compte à rebours `m:ss` du minuteur.
- **figure** (500, 1.875rem / 30 px, 1, -0,035em) : les chiffres des cartes — totaux, argent,
  heure de pose, statistiques.
- **headline** (500, 1.75rem / 28 px, 1,1, -0,03em) : la question du premier lancement, une par
  écran.
- **prompt** (400, 1.5rem / 24 px, 1,2, -0,025em) : la phrase du minuteur en cours (« Respire… »),
  15 caractères de large au plus.
- **craving** (600, 1.4375rem / 23 px, 1, -0,03em) : le libellé d'`Envie`.
- **brand** (600, 1.3125rem / 21 px, 1, -0,03em) : « quit » dans la barre haute, sur tous les
  écrans.
- **title** (500, 1.25rem / 20 px, 1,2, -0,02em) : titre d'écran sous l'accueil, titre de
  `Dialog` et de `Drawer`, statut en titre dans une carte.
- **lead** (400, 1.125rem / 18 px, 1,3, -0,01em) : la ligne sous un chiffre géant (« jours de
  streak · 07 h 42 »).
- **cta** (500, 1rem / 16 px, 1, -0,02em) : boutons, valeur des champs, lignes de liste.
- **body** (400, 0.9375rem / 15 px, 1,4) : lecture, libellés de ligne, sous-titres d'écran,
  puces.
- **label** (400, 0.8125rem / 13 px, 1,3) : titres de carte, libellés de champ, erreurs, lecture
  de graphique.
- **detail** (400, 0.75rem / 12 px, 1,2) : axes, étiquettes de dose, détail de badge.
- **tab** (500, 0.6875rem / 11 px, 1) : libellés de la barre d'onglets.
- **unit** (0.55em, 1, tracking 0) : l'unité d'un chiffre, relative au chiffre qu'elle suit.

### Named Rules

**The Share-of-Column Rule.** Les chiffres géants (`display`, `countdown`) sont en `cqi` : leur
parent est un `@container` sans padding, pour que la part se calcule sur toute la colonne. Le
streak garde 62cqi jusqu'à deux chiffres, puis `streakFigureSize` le réduit
(`min(62, floor(144 / chiffres))cqi`) pour qu'il ne dépasse jamais les gouttières.

**The Small Muted Unit Rule.** Une unité (`€`, `%`, `j`, `h`, `min`, après une espace
insécable) est posée plus petite et sourde derrière son chiffre : `Figure` découpe la chaîne
(`splitUnits`) et habille l'unité en `unit` + `muted`. La chaîne reste une seule phrase pour le
lecteur d'écran et une seule entrée dans le module de chaînes.

**The cn() Registration Rule.** Chaque taille et chaque rayon de `@theme` est déclaré dans
`src/shared/utils/cn.ts`, sinon tailwind-merge lit `text-tab` comme une couleur et le supprime
à côté d'un `text-<couleur>`. `cn.test.ts` échoue si un token manque.

## Layout

Une colonne unique centrée, `max-w-md` (448 px), pensée pour un iPhone 16 Pro en PWA
standalone (402 px) puis simplement centrée au-delà. Les brumes, elles, s'étalent sur toute la
largeur derrière la colonne.

- **Gouttières :** `px-safe` — `max(1.25rem, env(safe-area-inset-*))`. `pt-safe` en haut ;
  `pb-page` en bas des écrans (indicateur d'accueil + marqueur du bac à sable), `pb-safe-4`
  sous une action en zone pouce.
- **Barre haute :** 56 px minimum (`min-h-14`, `pt-2`), marque à gauche, contexte et contrôle
  44 px à droite ; le glyphe du contrôle déborde dans la gouttière (`-mr-2.5`) pour s'aligner.
- **Accueil :** brume sur les 640 px du haut ; le chiffre commence 64 px sous la barre haute ;
  les cartes commencent 64 px sous la ligne `lead`, à 12 px des bords (`px-3`, plus larges
  que la gouttière du texte), espacées de 10 px.
- **Écrans sous l'accueil (`AppShell`) :** hauteur d'écran (`min-h-svh`), pile à 16 px
  d'intervalle : barre haute, `PageHeader`, contenu. Une étape de formulaire tient son action
  en bas (`mt-auto`), dans la zone pouce.
- **Cibles tactiles :** 44 px minimum (`h-11`, `size-11`) ; 48 px pour un champ, un bouton
  `lg`, un item d'onglet ; 52 px pour une ligne de liste.

### Named Rules

**The Fixed Pill Rule.** `Envie` est fixe en bas à droite, sur un fondu vers `page` à 92 % ; le
contenu défilant réserve un dégagement bas (`pb-32` sur l'accueil) pour qu'aucune information
ne reste sous la pilule.

**The Thumb Zone Rule.** L'action principale d'un écran à décision (question du premier
lancement, `Arrêter`, `Enregistrer` d'une envie) vit en bas de l'écran, sur un fondu vers la
page quand elle colle (`sticky`).

## Elevation & Depth

Pas d'ombres portées : il n'existe aucun token `--shadow-*`. La profondeur vient de la brume,
de l'aplat `surface` sur la `page`, des filets et du voile. La seule `box-shadow` du monde est
la lueur d'`Envie` (dans l'utilitaire `bg-craving`), qui en fait l'objet allumé.

1. **La brume** — halos radiaux sur un plancher, fondue dans la page par un masque
   (`mask-haze` : opaque jusqu'à 65 %, puis transparent) pour que halos et grain s'éteignent
   ensemble, sans marche.
2. **Le grain** — bruit fractal SVG en ligne (`bg-grain`) en `mix-blend-overlay`, 35 %
   sur la brume d'accueil, 20 % sur celle du minuteur. C'est le seul grain du monde.
3. **La carte** — `surface` sur `page`, sans bord.
4. **Le filet** — 1 px `line` pour séparer, 1 px `ghost-line` pour borner ce qui se touche.
5. **Le voile** — `page` à 80 % sous le `Dialog` et le `Drawer`.
6. **Les fondus** — vers `page` sous `Envie`, sous une action collante, au bas d'une brume de
   minuteur (96 px).

### Shadow Vocabulary
- **Lueur Envie** (`box-shadow: 0 14px 40px -10px color-mix(in srgb, #fd429c 60%, transparent),
  inset 0 0 0 1px rgb(255 255 255 / 0.12)`) : `Envie` seul.

### Named Rules

**The Haze Placement Rule.** La brume ne s'éteint jamais, mais sa dose est fixée par écran :
- **Accueil** — la brume pleine (`HeroHaze` `hero`), 640 px, derrière la marque et le streak.
- **Premier lancement** — la même brume pleine (`hero`) : première impression du monde. Le texte
  secondaire posé dessus passe en `ink` pour tenir 4,5:1.
- **Tous les autres écrans** — la bande basse (`band`) : 192 px, 70 %, prune et ember
  seulement, **sans ambre sous le texte**, sur un plancher `floor-deep`, derrière la barre haute
  et le titre.
- **Minuteur d'envie** — sa propre brume liquide mousse et bronze, plein écran.
- **Minuteur arrêté avant la fin** — la même brume, à 60 % et immobile : jamais éteinte, jamais
  marquée.

**The Code-Drawn Rule.** Brumes, grain et icônes sont du code : aucun raster décoratif. Les
icônes de `public/` sont rendues par `scripts/render-icons.mjs` depuis les stops de `bg-haze` et
un « q » Host Grotesk blanc ; chaque PNG porte sa provenance dans un bloc `tEXt`. Changer un
stop de brume ou la police → relancer le script.

**The Focus Outline Rule.** Le focus est un `outline: 2px solid ink`, `outline-offset: 3px`,
posé globalement sur `:focus-visible`. Aucun composant ne dessine son propre anneau.

## Shapes

Tout ce qui se touche est une pilule ; tout ce qui contient est un rectangle doux.

| Token | Valeur | Où |
|---|---|---|
| `rounded-full` | pilule | tous les boutons, `Envie`, puces, plateau et onglets de `Tabs`, plateau segmenté, `Switch`, barre de progression, crans de minute, contrôle réglages |
| `rounded-hero` | 1.75rem / 28 px | bord d'ouverture du `Drawer` |
| `rounded-card` | 0.75rem / 12 px | carte, badge, `Dialog` |
| `rounded-control` | 0.625rem / 10 px | champ de saisie, item de la barre d'onglets |
| `rounded-step` | 0.5rem / 8 px | crans du multiplicateur |
| `rounded-mark` | 0.25rem / 4 px | bout de donnée d'une barre de graphique, jamais côté base |

Les contours font toujours 1 px (2 px seulement autour du pouce du slider, en `page`, et sur
l'anneau « à poser » du calendrier). Le carré
parfait n'existe qu'une fois : le badge (`aspect-square`).

## Components

### Barre haute (`TopBar`)
Une seule barre sur tous les écrans : « quit » en `brand` à gauche ; à droite, en `body`, le
contexte (« Étape 2 · 14 mg », « Minuteur d'envie ») puis un contrôle icône de 44 px
(réglages, trait 1,5, appui en `ghost`).

### En-tête d'écran et retour (`PageHeader`, `BackLink`)
Chaque écran sous l'accueil s'ouvre pareil : le chevron gauche (bouton `ghost` `icon` 44 px,
trait 1,75, tiré de 12 px dans la gouttière) **à côté** du titre en `title`, puis un sous-titre
optionnel en `body` `muted`. C'est la seule manière de remonter. Un formulaire se ferme par un
bouton `ghost` « Annuler » sous son action, jamais par un second chevron.

### Cards / Containers (`Card`)
- **Une seule carte :** `surface`, `rounded-card` (12 px), aucun bord, aucune ombre.
- **Marge intérieure :** `block` 20 px partout (la seule) ; `rows` 20 px sur les côtés, les
  lignes apportent leur hauteur ; `none` quand le contenu gère son retrait (grille, calendrier).
- **Titre :** une carte nommée est une région ; son titre est son `h2` (accueil) ou `h3` (sous le
  titre d'un écran), en `label` `muted` en haut, avec un aside optionnel en face ; 14 px entre
  lui et le contenu. Sans titre, `label` donne le nom accessible.
- **Chiffres en lignes (`FigureRows`) :** libellé `body` `muted` à gauche, chiffre `figure` à
  droite avec ses unités petites, filet `line` entre les lignes, 12 px de haut et de bas.
- **Résumé de statistiques :** grille 2 × 2 en `dl`, libellé `label` `muted` au-dessus du
  chiffre `figure`, cellules séparées par des filets.

### Buttons
Calmes, en pilule, `cta` 500, aucune ombre.
- **Tailles :** `default` 44 px / `sm` 36 px (`label`) / `lg` 48 px / `icon` 44 × 44 /
  `icon-sm` 36 × 36.
- **Primary :** aplat crème, texte `page` ; appui → crème à 85 %.
- **Secondary :** pilule fantôme, filet 1 px `ghost-line`, texte crème ; appui → `ghost`.
- **Ghost :** transparent, texte crème ; appui → `ghost`. Sert « Annuler » et le retour.
- **Destructive :** pilule fantôme à filet `alert` 50 %, libellé `alert` ; appui → `alert` 10 %.
  Placée dans un `Dialog` de confirmation ou sous un filet, jamais collée à « Enregistrer ».
- **Link :** texte `body` crème souligné en `ghost-line` (décalage 4 px), cible 44 px gardée.
- **Disabled :** aplat `ghost`, texte `muted`, bord effacé.
- **Retour tactile :** `scale(0.98)` en 150 ms `ease-out-expo`, figé sous `motion-reduce`. Pas
  d'état `hover` dédié : la cible est le doigt.

### Envie (signature)
La pilule permanente, seul objet allumé : 64 px de haut, au moins 62,5 % de la colonne, dégradé
horizontal `pink` → `yellow`, libellé `craving` en `page`, lueur rose. Fixe en bas à droite sur
son fondu. S'enfonce à `scale(0.97)`. Désactivée, elle perd dégradé et lueur : aplat `ghost`,
texte `muted`.

### Chips et segmented control
- **Puce (`Toggle`, `ToggleGroup`) :** pilule `ghost` 44 px, texte `body` crème ; pressée →
  aplat crème, texte `page`. Variante `outline` : filet `ghost-line`, pressée bordée de crème.
- **Segmented :** `ToggleGroup` avec `spacing={0}` + `variant="outline"` — un plateau pilule à
  filet `ghost-line`, 4 px de retrait, segments de 44 px à parts égales ; le segment pressé est
  une pilule crème dans le plateau.

### Inputs / Fields
- **Champ :** 48 px, `rounded-control`, fond `ghost`, filet 1 px `ghost-line`, retrait 16 px,
  valeur crème en `cta` 500 tabulaire, placeholder `muted` 400. Invalide → filet `alert`, et un
  `<p role="alert">` en `label` `alert` sous le champ. Les dates natives sont calées à gauche.
- **Switch :** piste 51 × 31 ; éteinte `ghost-line`, pouce blanc 27 px ; allumée crème, pouce
  `page`, translation 20 px en 150 ms.
- **Slider :** piste 8 px `line`, remplissage crème, pouce blanc 28 px cerclé 2 px de `page`,
  `scale(1.1)` à l'appui, zone tactile élargie de 8 px.
- **Tabs :** plateau pilule `ghost` 44 px, 4 px de retrait, texte `muted` ; onglet actif en
  pilule crème, texte `page`. Variante `line` : filet bas `line`, actif en crème souligné 2 px.

### Navigation
- **Liste de lignes (aujourd'hui) :** sur l'accueil, une carte `rows` de `RowLink` porte la
  navigation : chaque ligne 52 px, libellé `cta` 400 crème, chevron droit `muted` 18 px en bout,
  filet `line` entre les lignes ; appui → texte `muted`.
- **Barre d'onglets (avec M2) :** son aspect est fixé dans le spécimen `/design` et elle arrive
  avec Progression : fond `page`, filet haut `line` borné à la colonne, quatre items (Accueil ·
  Calendrier · Progression · Historique), icône 24 px sur libellé `tab`, item de 48 px. Actif →
  crème, sans fond ni indicateur ; inactif → `muted`, crème à l'appui. `aria-current="page"`.

### Streak hero (signature)
Sur la brume pleine : la barre haute, puis une colonne centrée — le chiffre du streak en
`display` blanc, puis une seule ligne `lead` : « jours de streak », un point dessiné (non lu),
et l'horloge `hh h mm` en `muted`. Le chiffre réel est lu en `sr-only` ; la valeur animée est
`aria-hidden`.

### Minuteur d'envie (signature)
- **En cours :** plein écran sur la brume liquide — deux taches bronze, une mousse, une tache
  `page`, floutées 48 px, qui dérivent sur 14 à 22 s en aller-retour ; la couche entière à 65 %,
  grain à 20 %. Barre haute avec « Minuteur d'envie ». Au centre, calé à gauche : la phrase en
  `prompt`, le compte à rebours en `countdown` blanc (`role="timer"`), « Temps restant » en
  `label`, puis une rangée de crans de minute sur toute la colonne (4 px, pilule, 6 px d'écart :
  tenue blanc, en cours blanc 45 %, à venir blanc 22 %). `Arrêter` en `secondary` `lg` pleine
  largeur, en zone pouce. Seules les secondes et la brume bougent.
- **Tenu jusqu'au bout :** la même brume en tête d'écran, fondue vers la page sur 96 px ; les
  minutes tenues en `display` blanc montent au compteur, les crans entrent en séquence — la
  célébration de l'app. Dessous, l'intensité et les situations.
- **Arrêté avant :** la brume reste, à 60 % et immobile ; titre et sous-titre, puis le même
  formulaire. Pas de fête, pas de reproche.

### Progression
- **Barre (`ProgressBar`) :** piste 8 px `line`, remplissage crème, largeur animée en 500 ms. Les
  bornes chiffrées vivent à côté : la barre ne porte jamais de texte.
- **Multiplicateur :** cinq crans de 42 px, `rounded-step`, filet 1 px : acquis → aplat crème,
  texte `page` ; courant → cerclé de crème, fond transparent, texte crème ; verrouillé → `ghost`,
  texte `muted`. Ils entrent en séquence, 60 ms d'écart (`step-in`).

### Badges
Carrés, `rounded-card`, 12 px de retrait, nom en `body` 500 et détail en `detail`. Débloqué →
`surface`, texte crème, détail `muted`, sans icône. Verrouillé → contour 1 px `line` sans fond,
texte `muted`, cadenas 24 px (trait 1,75) en haut ; « à débloquer » en `sr-only`.

### Calendrier
Grille mensuelle sur une surface de carte, mois en `title` et deux flèches de 44 px ; date en `label` tabulaire dans un disque de 24 px — le jour
même est le seul disque crème (texte `page`) ; jours à venir en `muted`, hors calendrier en
`muted` 80 %. Marques de 14 px sous la date, une forme par état : patch posé = point crème,
manqué = tiret `muted`, à poser = anneau crème, prévu = petit point `muted` ; écart = cigarette,
envie = minuteur. Premier jour d'étape : pastille `ghost` en `detail`.

### Graphiques
Sur une carte, une seule série en `series`. Colonnes de 24 px au plus, 2 px d'écart,
`rounded-mark` au bout de donnée, posées sur une ligne de base `ghost-line` ; barres horizontales
de 8 px, même règle, ligne de base à gauche. Changement d'étape = filet 1 px `muted` sur toute
la hauteur, dose en `detail` crème au-dessus. Axes en `detail` `muted`. Une ligne de lecture en
`label` nomme une colonne (nom crème 500) ; le doigt glissé en choisit une autre et les autres
passent à 60 %, jamais sous 3:1 contre la carte. Chaque graphique a son jumeau `table` en
`sr-only` (en `block`, pour ne jamais élargir la page).

### Overlays
- **Dialog :** carte `surface`, `rounded-card`, filet `line`, retrait 20 px, largeur `max-w-sm`,
  sur un voile `page` 80 % ; titre en `title`, description en `body` `muted`. Entrée / sortie :
  opacité + `scale(0.95)`, 200 ms.
- **Drawer :** feuille `surface`, `rounded-hero` sur le bord d'ouverture, voile `page` 80 %,
  poignée `ghost-line` de 4 × 96 px. La mécanique Base UI est intacte (courbes de 450 ms).

### Motion
Une seule signature : **le compteur par crans** (`countUpAt`). Un chiffre monte en pas entiers,
12 au plus, sur 240 ms — une roue qui se pose, jamais une interpolation fluide. Sur l'accueil,
il joue une fois par lancement (`useLaunchEntrance`) : jours et horloge montent ensemble et se
posent au même cran. `--ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`) pour tout ; 150 ms pour
un retour tactile, 200 ms pour un dialogue, 240 ms pour la signature et `step-in`, 500 ms pour
une barre.

**The Reduced Motion Rule.** Sous `prefers-reduced-motion: reduce`, les compteurs affichent la
valeur finale dès la première image ; la dérive de la brume, `step-in` et la séquence des crans
ne jouent que sous `motion-safe:` — la brume devient une image fixe ; toute transition porte
`motion-reduce:transition-none`.

## Do's and Don'ts

### Do:
- **Do** marquer toute sélection en aplat crème avec un texte `page`.
- **Do** placer la brume selon The Haze Placement Rule : pleine sur l'accueil et au premier lancement (texte secondaire en `ink` dessus), bande basse sans ambre partout ailleurs, brume mousse et bronze au minuteur, immobile et atténuée quand il est arrêté.
- **Do** construire tout bloc sur la carte unique : `surface`, rayon 12 px, 20 px de retrait.
- **Do** ouvrir tout écran sous l'accueil par la barre haute puis `PageHeader` (chevron à côté du titre) ; fermer un formulaire par un `ghost` « Annuler ».
- **Do** poser les unités d'un chiffre petites et sourdes via `Figure`.
- **Do** border tout contrôle en `ghost-line` (≥ 3:1) et séparer la structure en `line`.
- **Do** écrire les erreurs en `alert` sous leur champ, et le destructif en pilule fantôme à filet `alert`.
- **Do** vérifier chaque texte posé sur une brume : ≥ 3:1 pour la marque et le chiffre, ≥ 4,5:1 pour le texte courant.
- **Do** déclarer toute nouvelle taille ou tout nouveau rayon de `@theme` dans `src/shared/utils/cn.ts`.
- **Do** garder chaque animation derrière `motion-safe:` ou `motion-reduce:transition-none`, et rendre la valeur finale d'un compteur sous mouvement réduit.
- **Do** relancer `scripts/render-icons.mjs` après tout changement de stop de brume ou de police.

### Don't:
- **Don't** prêter le dégradé rose → jaune ou la lueur d'`Envie` à un autre objet.
- **Don't** peindre un texte, un contrôle ou une donnée avec une couleur de brume.
- **Don't** mettre d'ambre sous un texte hors de l'accueil : la bande basse est prune et ember seulement.
- **Don't** éteindre la brume d'un écran, ni celle du minuteur arrêté.
- **Don't** ajouter une ombre portée, un `ring-*` ou un anneau de focus par composant : le seul `box-shadow` est la lueur d'`Envie`, le focus est l'`outline` global.
- **Don't** remplir un bouton destructif d'un aplat teinté, ni colorer un écart en `alert`.
- **Don't** mettre l'ambre de série et le bronze du minuteur sur le même écran, ni une seconde couleur de série.
- **Don't** transformer une progression en anneau ou en jauge : une barre de 8 px avec ses bornes chiffrées, ou une rangée de crans.
- **Don't** ajouter un raster décoratif : brumes, grain et icônes sont du code.
- **Don't** créer une seconde barre haute, une seconde carte ou un second geste de retour.
- **Don't** animer un chiffre en interpolation fluide : par crans, 240 ms, `ease-out-expo`.
