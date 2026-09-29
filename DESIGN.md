---
name: quit
description: Un monde plat et typographique — une famille bleu marine, une page blanche, aucune ombre, et une seule image : la nuit derrière le chiffre.
colors:
  page: "#fafafa"
  ink: "#1b3c53"
  ink-soft: "#5e6c78"
  ink-dim: "#4a5a66"
  on-ink: "#e3e3e3"
  action: "#234c6a"
  reached: "#456882"
  surface: "#e3e3e3"
  surface-locked: "#d4d4d4"
  line: "#d4d4d4"
  alert: "#a6392f"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11rem"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1
  title:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.2
  cta:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    lineHeight: 1.35
  label:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.25
  detail:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    lineHeight: 1.2
  tab:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.65625rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  hero: "1.75rem"
  card: "0.875rem"
  control: "0.75rem"
  step: "0.625rem"
  pill: "9999px"
spacing:
  gutter: "1.25rem"
  block: "1.25rem"
  section: "2rem"
  card-padding: "0.75rem"
  grid-gap: "0.5rem"
  step-gap: "0.375rem"
components:
  hero:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.hero}"
    typography: "{typography.display}"
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.page}"
    rounded: "{rounded.control}"
    typography: "{typography.body}"
    height: "2.75rem"
    padding: "0 1rem"
  button-primary-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "2.75rem"
    padding: "0 1rem"
  button-secondary-active:
    backgroundColor: "{colors.surface-locked}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "2.75rem"
    padding: "0 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "2.75rem"
    padding: "0 1rem"
  button-destructive:
    textColor: "{colors.alert}"
    rounded: "{rounded.control}"
    height: "2.75rem"
    padding: "0 1rem"
  button-disabled:
    backgroundColor: "{colors.surface-locked}"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.control}"
  craving-button:
    backgroundColor: "{colors.action}"
    textColor: "{colors.page}"
    rounded: "{rounded.pill}"
    typography: "{typography.cta}"
    height: "4rem"
    padding: "0 1.5rem"
  craving-button-disabled:
    backgroundColor: "{colors.surface-locked}"
    textColor: "{colors.ink-dim}"
  multiplier-step-acquired:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.step}"
    height: "2.625rem"
  multiplier-step-current:
    backgroundColor: "{colors.reached}"
    textColor: "{colors.white}"
    rounded: "{rounded.step}"
    height: "2.625rem"
  multiplier-step-locked:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.step}"
    height: "2.625rem"
  level-bar-track:
    backgroundColor: "{colors.line}"
    rounded: "{rounded.pill}"
    height: "0.5rem"
  level-bar-fill:
    backgroundColor: "{colors.action}"
    rounded: "{rounded.pill}"
    height: "0.5rem"
  badge-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0.75rem"
  badge-card-locked:
    backgroundColor: "{colors.surface-locked}"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.card}"
    padding: "0.75rem"
  tab-item:
    textColor: "{colors.ink-soft}"
    typography: "{typography.tab}"
    rounded: "{rounded.control}"
    height: "3rem"
  tab-item-active:
    textColor: "{colors.action}"
  tabs-list:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.control}"
    height: "2.75rem"
    padding: "0.25rem"
  tabs-trigger-active:
    backgroundColor: "{colors.action}"
    textColor: "{colors.page}"
    rounded: "{rounded.step}"
  switch-track:
    backgroundColor: "{colors.line}"
    rounded: "{rounded.pill}"
    width: "51px"
    height: "31px"
  switch-track-checked:
    backgroundColor: "{colors.action}"
  dialog:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.25rem"
  drawer:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hero}"
---

# Design System: quit

## Overview

**Creative North Star : « Le relevé »**

Une seule famille bleu marine porte tous les faits, sur une page presque blanche. Rien n'est
grainé ni ombré : la profondeur vient de la couleur et du filet, jamais de la lumière. Le
monde est le standard de la catégorie exécuté à fond — plat, typographique, lisible en plein
soleil à une main.

Le monde a gagné **une seule image**, et elle est nommée : une marine de nuit en aplats
vectoriels derrière le chiffre du streak. Elle ne rompt pas la règle du plat — pas de photo,
pas de grain, pas de texture, aucune valeur hors de la famille marine — elle donne au seul
bloc qui porte le chiffre géant une raison d'être un lieu plutôt qu'un rectangle. Partout
ailleurs, le fond reste un aplat.

La hiérarchie est brutalement inégale, et c'est voulu : un chiffre de 176 px règne sur le bloc
héros, tout le reste vit entre 10,5 px et 22 px. Une donnée est un chiffre, pas une jauge :
le niveau est une barre de 8 px avec ses bornes chiffrées, le multiplicateur est une rangée
de crans, jamais un anneau de progression.

Anti-références confirmées : l'anneau de progression santé vert sur blanc ; le flipper
(cartoon, saturé, sur-ornementé) ; toute métaphore matérielle (veste de travail, livret
tamponné, manuel en acétate), refusée comme « skin » ; les variantes Instrument / Affiche /
Registre, jugées froides et « AI-looking ».

**Key Characteristics :**
- Une famille marine + un gris, et une seule exception chaude (`alert`)
- Aucune ombre, nulle part
- Une seule image dans toute l'app : le fond du héros, en aplats, dans la famille
- Une seule police variable, chiffres tabulaires partout
- Un chiffre géant centré, tout le reste petit
- Un seul geste de motion signature (240 ms, par crans, jamais fluide)
- Le pouce d'abord : `Envie` fixe, barre d'onglets basse, cibles ≥ 44 px

## Colors

Une famille marine du plus profond au plus clair, deux gris de surface, et un seul rouge
réservé au danger.

### Primary
- **Marine profond** (`ink`) : le texte courant, le bloc héros, et tout état **acquis** —
  un cran de multiplicateur déjà gagné, l'écrasement d'un bouton primaire.
- **Marine d'action** (`action`) : la couleur de ce que l'utilisateur déclenche ou gagne —
  pilule `Envie`, remplissage XP, onglet actif, puce d'onglet sélectionnée, bouton primaire,
  `Switch` coché, anneau de focus, sélection de texte, caret.

### Secondary
- **Acier atteint** (`reached`) : un seul rôle, le cran de multiplicateur **courant**.
  Cette couleur n'habille rien d'autre.

### Tertiary
- **Rouge d'alerte** (`alert`) : unique valeur chaude du monde. Destructif et erreurs,
  rien d'autre. Jamais en aplat plein : le bouton destructif l'utilise à 10 % d'opacité de
  fond avec le texte en plein (20 % à l'appui).

### Neutral
- **Page** (`page`) : le fond de toute l'application, et la couleur du texte posé sur `action`.
- **Encre douce** (`ink-soft`) : texte secondaire **sur la page** uniquement (5,17:1).
- **Encre sourde** (`ink-dim`) : texte secondaire **sur tout fond teinté** — `surface`,
  `surface-locked`, remplissages désactivés, plateau de `Tabs` (5,56:1 sur `surface`,
  4,81:1 sur `surface-locked`).
- **Sur encre** (`on-ink`) : le texte posé sur le bloc héros marine.
- **Surface** (`surface`) : cartes et plateaux.
- **Surface verrouillée** (`surface-locked`) : badge verrouillé, remplissage désactivé.
- **Filet** (`line`) : filets, contours, pistes de barre et de slider, poignée de tiroir.
  Même valeur que `surface-locked`, rôle différent : ne pas fusionner les deux tokens.

### Hors tokens : la marine de nuit

L'illustration du héros n'introduit aucun token. Ses aplats sont pris dans la famille et
n'existent que dans le fichier image : fond de ciel et d'eau ≈ `#163e59` (le voisin sombre de
`ink`), bandes de vagues et collines entre `#265375` et `#426e8e` (autour de `reached`), écume
en blanc cassé ≈ `#f1f1ee`. Aucune de ces valeurs ne doit être recopiée dans `@theme` ni
utilisée pour habiller un composant.

### Named Rules

**The Two Greys Rule.** Le gris de texte muet se choisit **par fond, pas par humeur**.
Sur `page` → `ink-soft`. Sur n'importe quel fond teinté → `ink-dim`. `ink-soft` sur un fond
teinté tombe à 4,20:1 et échoue : c'est la seule raison d'être de `ink-dim`.

**The Three States Rule.** « Sélectionné » est toujours `action`. « Acquis » est `ink`.
« Courant » est `reached`. Ces trois-là ne doivent jamais s'effondrer en une seule couleur.

**The One Warm Value Rule.** `alert` est la seule exception chaude approuvée à la famille
marine-et-gris. Elle appartient aux actions destructives et aux erreurs, et à rien d'autre.
Pas de succès vert, pas d'avertissement ambre, pas de second accent.

**The One Illustration Rule.** Il y a **une** image dans toute l'app : la marine de nuit du
bloc héros. Elle est décorative (`aria-hidden`), en aplats vectoriels, entièrement dans la
famille marine, et `bg-ink` reste le plancher si elle n'arrive jamais. Pas de seconde
illustration, pas de photo, pas d'icône décorative, pas de fond illustré sur une carte.

## Typography

**Une seule famille :** Bricolage Grotesque Variable (`--font-sans`), auto-hébergée via
`@fontsource-variable`, axe optique 12–96 avec `font-optical-sizing: auto`, graisses 400 /
500 / 600 / 700 / 800. Pas de police display séparée, pas de mono.

**Character :** un grotesque variable légèrement excentrique, tenu en laisse — la seule
liberté prise est le chiffre géant. `font-variant-numeric: tabular-nums` est posé sur `body` :
tout chiffre qui change (streak, heures, XP, euros) ne doit jamais faire danser la ligne.

### Hierarchy
- **display** (800, 11rem / 176 px, line-height 0,9, tracking -0,02em) : le chiffre du streak,
  et lui seul.
- **figure** (600, 1.375rem / 22 px, line-height 1) : temps, XP, argent — les chiffres tabulaires.
- **title** (600, 1.1875rem / 19 px, line-height 1,2) : titres de tiroir et de dialogue.
- **cta** (700, 1.0625rem / 17 px, line-height 1) : le bouton `Envie`.
- **body** (400, 0.9375rem / 15 px, line-height 1,35) : lecture — boutons, cartes, tout le reste.
- **label** (500, 0.8125rem / 13 px, line-height 1,25) : libellés, contexte, valeurs secondaires.
- **detail** (400, 0.6875rem / 11 px, line-height 1,2) : détail de badge.
- **tab** (600, 0.65625rem / 10,5 px, line-height 1) : libellés de la barre d'onglets.

### Named Rules

**The cn() Registration Rule.** `src/shared/utils/cn.ts` enregistre **chaque** taille de
`@theme` dans le groupe `font-size` de tailwind-merge. Sans ça, `text-tab` est lu comme une
couleur et silencieusement supprimé dès qu'un `text-<couleur>` se trouve dans le même appel
`cn()`. **Tout nouveau token de taille doit être ajouté à ce tableau** — c'est le point unique
dont dépend toute l'échelle typographique.

**The One Giant Rule.** Un seul `text-display` par écran, et seulement pour le chiffre du
streak — ou, sur l'écran du minuteur d'envie, pour son compte à rebours puis ses minutes
tenues : le moment d'envie gagne, et le streak n'y est pas affiché. Il n'y a pas de second
niveau « grand » : après 176 px, on retombe à 22 px.

**The French UI Rule.** Toute chaîne visible est en français et vit dans
`src/shared/utils/strings.ts`. Jamais de littéral dans un composant, jamais d'anglais à
l'écran. Le code, lui, reste en anglais.

## Layout

Colonne unique centrée, `max-w-md` (28rem / 448px), pensée pour un iPhone en PWA standalone
puis simplement centrée au-delà. **Le héros est dans la colonne, pas en pleine page** : sur
iPhone la colonne *est* le viewport et le bloc touche les deux bords ; au-delà de 448px il se
centre avec le reste et garde ses coins bas arrondis. Le `<main>` racine porte `min-h-dvh
bg-page`, et c'est lui qui remplit l'écran quand la colonne ne le fait pas.

- **Gouttières :** utilitaire `px-safe` — `max(1.25rem, env(safe-area-inset-*))`. Jamais un
  `px-5` nu sur un conteneur pleine largeur : l'encoche et le coin arrondi mangeraient le texte.
  `pt-safe`, `pb-safe` et `pb-safe-4` (`calc(1rem + env(safe-area-inset-bottom))`) couvrent
  haut et bas.
- **Rythme vertical :** 20px entre blocs de contenu (héros → multiplicateur → niveau →
  badges), 32px entre grandes sections, 10px entre l'en-tête d'une section et son contenu.
- **Grilles :** badges en 3 colonnes, gap 8px, cartes carrées (`aspect-square`) ;
  multiplicateur en 5 colonnes, gap 6px, hauteur 42px.
- **Bloc héros :** part du bord haut de la colonne, coins bas arrondis 28px, `px-safe pt-safe`.
  Il n'a pas de marge haute : il *est* le haut de l'écran. À l'intérieur, deux zones seulement :
  une ligne haute de 56px minimum (marque à gauche, contexte + réglages à droite) et, sous elle,
  **une colonne centrée** — chiffre 176px, libellé, horloge `hh:mm:ss` — en `pt-6 pb-9` avec un
  interligne de 4px entre les trois. Le chiffre n'est plus aligné à gauche : centré, il tient la
  même place qu'il affiche 3 ou 128 jours.
- **Zone pouce :** `Envie` est fixe, aligné à droite, au-dessus de la barre d'onglets. La
  barre d'onglets suit la colonne de contenu (`max-w-md`) — son filet supérieur ne doit pas
  être en pleine largeur, sinon il flotte hors de la colonne sur grand écran.
- **Cibles tactiles :** 44px minimum (`min-h-11` / `size-11`), 48px pour un item d'onglet.

### Named Rules

**The Fixed Pill Rule.** Le contenu scrollable réserve un dégagement bas (`pb-44` sur le
spécimen) pour que la pilule `Envie` fixe ne recouvre jamais une information à lire.

## Elevation & Depth

**Aucune ombre, nulle part.** Il n'existe aucun token `--shadow-*`, et aucun `box-shadow`
n'est écrit dans le code. La profondeur se lit sur quatre registres seulement :

1. **Aplat coloré** — le bloc héros marine sur la page blanche ; une carte `surface` sur la page.
2. **Filet 1px** — `border-line` pour les contours, `border-t` pour la barre d'onglets,
   `divide-line` pour les listes.
3. **Voile modal** — `bg-ink/40` pour le fond de `Dialog` et de `Drawer`.
4. **Scrim du héros** — une bande de 112px (`h-28`) collée au bas du bloc héros,
   `bg-linear-to-t from-ink/75 to-transparent`, posée entre l'image et le texte. Elle ne
   crée pas de relief : elle rachète le contraste du libellé et de l'horloge au-dessus des
   crêtes claires de la vague, qui seules passeraient sous 4,5:1.

Ce sont les deux seuls assombrissements autorisés, et le scrim est le seul dégradé du monde.

### Named Rules

**The No-Shadow Rule.** Une surface qui doit paraître plus proche change de couleur ou gagne
un filet. Elle ne gagne jamais une ombre, ni un `ring-*`, ni un dégradé. Le focus est un
`outline: 2px solid action` avec `outline-offset: 3px`, posé globalement sur `:focus-visible` —
les composants ne redéfinissent pas leur anneau.

**The Scrim-Is-Contrast Rule.** Le dégradé n'existe dans ce monde que pour rendre un texte
lisible au-dessus de l'illustration du héros, jamais pour décorer, adoucir un bord ou
suggérer de la profondeur. Un fond uni n'a jamais besoin d'un scrim : s'il en réclame un,
c'est la couleur du texte qui est fausse.

## Shapes

Quatre rayons nommés, plus la pilule. Ils descendent avec la taille de l'objet :

| Token | Valeur | Où |
|---|---|---|
| `rounded-hero` | 1.75rem / 28px | bloc héros (coins bas), bord d'attaque du tiroir |
| `rounded-card` | 0.875rem / 14px | cartes de badge, `Dialog` |
| `rounded-control` | 0.75rem / 12px | boutons, plateau `Tabs`, item d'onglet |
| `rounded-step` | 0.625rem / 10px | crans de multiplicateur, `Toggle`, puce de `Tabs` |
| `rounded-full` | pilule | `Envie`, barre XP, piste de slider, pouce, `Switch` |

Les contours sont toujours des filets de 1px en `line` (2px seulement sur le pouce du slider,
en `action`). Pas de coins vifs, pas de découpe, pas de biseau. Le carré parfait n'existe
qu'une fois : la carte de badge (`aspect-square`).

## Components

### Buttons

Le bouton est calme et franc : fond plat, rayon 12px, texte `body` en 600, aucune ombre.

- **Shape :** `rounded-control` (12px). Tailles : `default` 44px / `sm` 36px / `lg` 48px /
  `icon` 44×44 / `icon-sm` 36×36.
- **Primary :** fond `action`, texte `page`. À l'appui, le fond descend vers `ink`.
- **Secondary :** fond `surface`, texte `ink` ; appui → `surface-locked`.
- **Outline :** filet `line`, fond transparent, texte `ink` ; appui → `surface`.
- **Ghost :** transparent, texte `ink` ; appui → `surface`.
- **Destructive :** fond `alert` à 10 %, texte `alert` ; appui → 20 %.
- **Disabled :** fond `surface-locked`, texte `ink-dim`, pointer-events coupés.
- **Feedback :** `active:scale-[0.98]` sur 150 ms en `ease-out-expo`, neutralisé sous
  `motion-reduce`. Pas d'état `hover` dédié : la cible est le doigt.

### Envie (signature)

La pilule permanente, et le seul objet de l'app de cette taille : 64px de haut,
`rounded-full`, fond `action`, texte `page` en `cta`, icône `Timer` 20px. Elle s'enfonce à
`scale-[0.97]` à l'appui. **Rien d'autre ne porte `action` en aplat plein à cette échelle.**
Désactivée, elle passe `surface-locked` / `ink-dim`.

### Minuteur d'envie (signature)

L'écran entier devient le bloc de nuit : `bg-ink` plein cadre, même marine en fond, `px-safe
pt-safe`. Au centre, le compte à rebours `m:ss` en `display` (on-ink), dessous **quatre crans
de minute** (8px, `rounded-full`, grille 4 colonnes, `max-w-60`) : tenue → `on-ink`, en cours →
`on-ink` à 45 %, à venir → `on-ink` à 15 % ; puis une phrase en `body` `on-ink/85`. `Arrêter`
est en zone pouce : outline sur marine, filet `on-ink/40`, appui `on-ink/15`. Rien ne bouge
que les secondes. **Tenu jusqu'au bout**, le bloc reprend la forme du héros (coins bas 28px) :
les minutes tenues montent en `useCountUp` et les quatre crans entrent en séquence (`step-in`,
60 ms) — la seule célébration de l'app, sous `motion-safe:`. **Arrêté**, on reste sur la page :
pas de fête, pas de reproche.

### Cards / Containers

- **Badge :** carré, `rounded-card`, padding 12px, nom en `body` 600 + détail en `detail`.
  Débloqué → fond `surface`, texte `ink`, détail `ink-dim`, pas d'icône. Verrouillé → fond
  `surface-locked`, texte `ink-dim`, cadenas `Lock` 24px (stroke 1,75) en haut. Le suffixe
  « à débloquer » est en `sr-only`, jamais affiché.
- **Résumé du protocole (accueil) :** section titrée comme les autres blocs (`Protocole` en
  `body` 600, `Étape n / N` en aside `ink-soft`), puis une carte `surface`, `rounded-card`,
  padding 16px. À gauche : `Jour d sur D` en `figure`, puis dose et jours restants en `label`
  `ink-dim`, puis la marque seule sur sa ligne, tronquée. À droite : `Modifier` en outline
  `sm`, appui en `surface-locked` (sur `surface`, l'appui par défaut ne se verrait pas).
  Protocole fini → `Protocole terminé` en `title`, jamais en `figure` : ce n'est pas un chiffre.
- **Acquis (accueil, sous le héros) :** une seule carte `surface`, `rounded-card`, `py-4`,
  en `dl` à colonnes égales séparées par un filet `divide-line` — un relevé, pas des tuiles de
  stat. `Jours sans fumer` toujours ; `Plus long streak` (`2 j 23 h`) seulement après une
  rechute. Libellé `label` `ink-dim`, chiffre `figure`, chiffres alignés en bas de colonne.
  Le héros dit « jours de streak » : « jours sans fumer » est réservé au total.
- **Économies (accueil) :** sous les acquis et leur note, la même carte-relevé en `dl` à
  deux colonnes : `Argent économisé` (`220,08 €`) et `Cigarettes non fumées` (`1 200`),
  formatés en français (`formatEuros`, `formatCount`). Sans dépense ni référence, une phrase
  `ink-dim` et le lien vers les réglages, jamais un faux zéro.
- **Objectif (accueil) :** section titrée comme le protocole (`Objectif`, aside `55 %` puis
  `Atteint` en `ink-soft`), carte `surface` padding 16px. En cours : libellé en `body` 600,
  `220,08 € sur 400 €` en `label` `ink-dim`, `Modifier` outline `sm` à droite, puis la barre de
  progression (celle du niveau). Atteint : libellé, prix en `figure`, barre pleine, une phrase ;
  `Nouvel objectif` à droite. À la première vue seulement, le prix monte en `useCountUp`, la
  barre suit et `Atteint` entre en `step-in` ; ce « vu » est gardé dans le journal. Sans
  objectif : la phrase, puis `Choisir un objectif` dessous, jamais serré à côté.
- **Note d'écart (accueil) :** après un écart seulement, collée sous la carte des acquis
  (gap 12px, c'est sa note de bas de carte) : `Dernière cigarette il y a …` en `body`
  `ink-soft`, puis, tant que la série est ouverte (un ou deux jours), la ligne du seuil de
  rechute. Pas de carte, pas de couleur : un constat.
- **Encart de rechute (écran d'écart) :** carte `surface`, `rounded-card`, padding 16px,
  entre le compteur et le bouton, seulement quand l'écart saisi ferait une rechute. Titre en
  `body` 600, coût en `body` `ink-dim`. Jamais `alert` : c'est une information, pas une erreur.
- **Carte d'étape (éditeur) :** `fieldset` à filet `line`, `rounded-card`, padding 16px,
  **sans `legend`** (WebKit la laisse couper le filet) : un `h3` nomme le groupe via
  `aria-labelledby`. Ligne haute : titre à gauche, trois boutons `ghost` `icon` (monter,
  descendre, supprimer) à droite ; désactivés, ils s'estompent à 30 % sans aplat, car l'aplat
  `surface-locked` s'y lirait comme une sélection. Dose et durée côte à côte, marque pleine
  largeur.
- **Unités :** toujours une espace insécable entre un nombre et son unité (`21 mg`,
  `28 j`, `24 h`), dans `strings.ts`.
- **Historique :** un relevé, pas des cartes. Un jour par section, titré comme les blocs de
  l'accueil (`body` 600 : `Aujourd’hui`, `Hier`, puis la date). Lignes séparées par
  `divide-line`, 64px minimum, appui en `surface` : heure en `body` `ink-soft` sur la ligne de
  base du titre, titre en `body` 600, détails en `label` `ink-soft` tronqués, chevron `ink-soft`
  centré — les trois passent `ink-dim` pendant l'appui (The Two Greys Rule). La consigne n'apparaît que s'il y a des lignes ; vide, une seule phrase.
- **Écran d'un fait :** le formulaire qui l'a enregistré, prérempli ; `Supprimer` (destructif,
  `lg`) vient **sous un filet `line`**, jamais collé à `Enregistrer`. Supprimer une cigarette
  passe par un `Dialog` (`Oui, supprimer` / `Garder`) ; les autres faits partent en un tap.
- **Réglages :** **un seul formulaire, un seul `Enregistrer`** (`lg`, pleine largeur) pour le
  moment de l'arrêt, la dépense et les cigarettes par jour — pas une carte ni un bouton par
  valeur. Les champs sont posés sur la page comme ceux de l'objectif, libellé `label` au-dessus.
  `Enregistrer` dort tant que rien ne diffère de ce qui est en vigueur. Tout passe ou rien :
  chaque refus s'affiche **sous son propre champ** (exception à l'alerte unique près du bouton,
  car trois valeurs indépendantes peuvent être refusées ensemble). L'enregistrement réussi
  ramène à l'accueil, comme le protocole et l'objectif : c'est l'accueil, qui montre déjà
  l'effet, qui acquitte. Jamais de libellé « Enregistré » à côté du bouton. Dessous, à 32px :
  `Modifier le protocole` puis la sauvegarde, chacun dans sa carte `surface`.
### Bloc héros (signature)

Le seul objet illustré de l'app. Une `section` en `relative isolate overflow-hidden`, fond
`ink`, texte `on-ink`, coins bas 28px, `px-safe pt-safe`, avec un `aria-label` stable qui ne
suit pas le pluriel du chiffre.

- **Fond :** `HeroBackdrop`, en `absolute inset-0 -z-10`, `aria-hidden`. Une marine de nuit en
  aplats, servie en AVIF avec repli WebP sur trois largeurs (768 / 1152 / 1536),
  `sizes="(min-width: 448px) 448px, 100vw"` — 8,7 Ko atteignent le téléphone. `object-cover`,
  `fetchPriority="high"`, `decoding="async"` : elle peint avec le premier viewport. Les deux
  formats sont dans le precache Workbox, sinon l'image manque hors ligne. `bg-ink` reste le
  plancher : si l'image n'arrive jamais, le bloc est exactement le bloc plat d'avant.
- **Scrim :** `absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-ink/75 to-transparent`,
  dans le backdrop, sous le contenu. Contraste, pas décor (voir _Elevation & Depth_).
- **Ligne haute :** `min-h-14`, marque en `label` 600 à gauche ; à droite, sur une seule ligne,
  le contexte de protocole en `label` `on-ink/80` puis le contrôle `Réglages` (44×44,
  `rounded-control`, `active:bg-on-ink/15`). Les deux slots sont optionnels : l'accueil du
  premier jour les laisse vides sans que la ligne bouge.
- **Colonne centrée :** chiffre `display` (176px), libellé `body`, horloge `figure`
  `hh:mm:ss` à deux chiffres, `pt-6 pb-9`, gap 4px. Le chiffre réel est lu en `sr-only` et la
  valeur animée est `aria-hidden`.

### Navigation

Barre basse, quatre items (Accueil · Calendrier · Progression · Historique), icône 24px
au-dessus du libellé `tab`, hauteur d'item 48px, filet supérieur `line`, fond `page`,
`pb-safe`. Actif → `text-action` (couleur seule, pas de fond, pas d'indicateur). Inactif →
`ink-soft`, `active:text-ink`. `aria-current="page"` sur l'item actif.

### Inputs / Fields

- **Switch :** piste 51×31 (dimensions iOS), pouce blanc 27px, `line` au repos, `action`
  coché, translation 20px en 150 ms.
- **Slider :** piste 8px `line` (identique à la barre XP), remplissage `action`, pouce 28px
  blanc cerclé de 2px `action`, `active:scale-110`, zone tactile élargie par un `after`
  de -8px.
- **Segmented control :** c'est `ToggleGroup` avec `spacing={0}` + `variant="outline"` —
  un cadre en filet unique, segments fusionnés séparés par un `border-l`, hauteur 48px,
  segment pressé en aplat `action` / texte `page`.
- **Tabs :** plateau `surface` de 44px, padding 4px, `rounded-control`, texte `ink-dim` ;
  onglet actif en aplat `action` / texte `page`, `rounded-step`. Variante `line` : pas de
  plateau, filet bas `line`, actif en `text-action` + soulignement 2px `action`.
- **Champ date et heure :** `input type="datetime-local"` natif, hauteur 48px,
  `rounded-control`, filet 1px `line`, fond `white` (le champ se détache de la `page`),
  padding horizontal 16px, texte `ink` en `cta` semi-gras. Le sélecteur reste celui du
  système. Erreur : `aria-invalid` + un `<p role="alert">` en `text-alert` / `label` sous le
  champ, relié par `aria-describedby` — le même pour la date future et la date illisible.
- **Compteur (stepper) :** même peau que le champ date (48px, filet `line`, fond `white`),
  boutons `ghost` `icon` `−` / `+` (lucide) aux bords, valeur centrée en `cta` chiffres
  tabulaires dans un `output`. Plancher : `−` désactivé, sans aplat. `fieldset` sans
  `legend`, nommé par son libellé via `aria-labelledby`.
- **Champ texte / nombre :** même peau que le champ date. Les nombres sont des `input` texte
  avec `inputMode` (`decimal` pour une dose, qui accepte la virgule ; `numeric` pour des
  jours), jamais `type="number"`. Erreur : même mécanique, un seul `<p role="alert">` pour le
  formulaire, près du bouton d'enregistrement, et `aria-invalid` sur chaque champ fautif.

### Overlays

- **Dialog :** carte `page` centrée, `rounded-card`, padding 20px, `max-w-sm`, voile
  `ink/40`. Entrée/sortie : opacité + `scale-95`, 200 ms `ease-out-expo`.
- **Drawer :** feuille `page` pleine largeur, `rounded-t-hero` (28px) sur le bord d'attaque,
  voile `ink/40`, poignée de swipe en `line` (4px × 96px). La mécanique Base UI est intacte ;
  seules les couleurs et les rayons sont retokenisés.

### Level bar (`ProgressBar`)

Piste `line` de 8px, `rounded-full`, remplissage `action` animé en largeur sur 500 ms
`ease-out-expo`, coupé sous `motion-reduce`. Les bornes chiffrées (`620 / 1 000 XP`) vivent
à côté, en `label` : **la barre ne porte jamais de texte**. La même barre porte l'objectif ;
en euros, son `aria-valuetext` lit `220,08 € sur 400 €`, jamais les centimes bruts.

### Multiplier steps (signature)

Cinq crans de 42px en grille 5 colonnes, `rounded-step`, chacun avec un filet :
acquis → `ink` sur `ink`, texte `on-ink` · courant → `reached` sur `reached`, texte `white` ·
verrouillé → filet `line`, fond transparent, texte `ink-soft`. Ils entrent en séquence,
60 ms de décalage par cran (`--animate-step-in`, 240 ms), sous `motion-safe:` uniquement.

### Motion

**Une seule signature : `useCountUp`.** Le chiffre du streak monte en **pas entiers** sur une
cadence fixe, durée totale 240 ms, 12 pas maximum — une roue de compteur qui se pose, jamais
une interpolation fluide image par image. La valeur réelle reste lisible pour les lecteurs
d'écran (`sr-only`) pendant que le chiffre animé est `aria-hidden`. Sous
`prefers-reduced-motion: reduce`, la cible est rendue dès le premier paint.

Le reste du vocabulaire est court et unique : `--ease-out-expo`
(`cubic-bezier(0.16, 1, 0.3, 1)`) pour tout ; 150 ms pour un retour tactile, 200 ms pour un
dialogue, 240 ms pour la signature, 500 ms pour le remplissage XP. Le tiroir garde ses
courbes Base UI (450 ms) : c'est de la mécanique, pas du style.

### Named Rules

**The Motion-Guard Rule.** Toute transition ou animation porte son garde : `motion-safe:`
pour ce qui doit disparaître, `motion-reduce:transition-none` pour ce qui doit se figer.
Aucune exception.

## Do's and Don'ts

### Do:
- **Do** choisir le gris muet par le fond : `ink-soft` sur `page`, `ink-dim` sur tout fond teinté.
- **Do** garder `action` pour « sélectionné », `ink` pour « acquis », `reached` pour « courant ».
- **Do** enregistrer toute nouvelle taille `@theme` dans le groupe `font-size` de
  `src/shared/utils/cn.ts`, sinon la classe sera silencieusement supprimée.
- **Do** utiliser `px-safe` / `pt-safe` / `pb-safe` sur tout conteneur qui touche un bord.
- **Do** rendre la profondeur par la couleur ou un filet 1px `line`.
- **Do** garder `bg-ink` sous l'illustration du héros : le bloc doit rester lisible si l'image
  n'arrive pas, et le texte posé dessus doit tenir 4,5:1 sur les crêtes claires, scrim compris.
- **Do** garder les chiffres en `tabular-nums` et poser les valeurs qui changent en `figure`.
- **Do** écrire toute chaîne visible en français, dans `src/shared/utils/strings.ts`.
- **Do** garder les cibles tactiles à 44px minimum et le déclencheur principal en zone pouce.
- **Do** assortir chaque transition d'un garde `motion-safe:` ou `motion-reduce:`.

### Don't:
- **Don't** ajouter une ombre, un `ring-*`, une texture ou un grain : rien de tout ça n'existe
  dans ce monde. Le seul dégradé autorisé est le scrim du héros, et il sert le contraste.
- **Don't** ajouter une seconde image. L'app en a une, le fond du héros ; une carte, un état
  vide ou un badge se dessinent en type et en aplat.
- **Don't** introduire une seconde couleur d'accent. `alert` est la seule valeur chaude, et
  elle est réservée au destructif et aux erreurs.
- **Don't** habiller `alert` en aplat plein : fond à 10 % / 20 %, texte en plein.
- **Don't** utiliser `reached` ailleurs que sur le cran de multiplicateur courant.
- **Don't** redéfinir un anneau de focus par composant : l'`outline` global `:focus-visible`
  fait foi.
- **Don't** transformer une progression en anneau ou en jauge : une barre de 8px avec ses
  bornes chiffrées, ou une rangée de crans.
- **Don't** poser un second `text-display` sur un écran, ni créer un palier intermédiaire
  entre 176px et 22px.
- **Don't** fusionner `line` et `surface-locked` sous prétexte qu'ils partagent `#d4d4d4` :
  ce sont deux rôles distincts qui peuvent diverger.
- **Don't** animer en interpolation fluide : la signature est par pas, 240 ms, `ease-out-expo`.
- **Don't** écrire un littéral de chaîne dans un composant, ni une chaîne anglaise à l'écran.
