import type { SplitDuration } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'

/** Synthetic figures for the /design specimen. Nothing here is read from a journal. */

export const MULTIPLIER_STEPS = [1, 2, 3, 4, 5] as const

const SPECIMEN_DURATION: SplitDuration = { days: 12, hours: 7, minutes: 42, seconds: 9 }

export const SPECIMEN_STREAK = {
  duration: SPECIMEN_DURATION,
  multiplier: 3,
} as const

export const SPECIMEN_PROTOCOL = { stepNumber: 1, doseMg: 21 } as const

export const SPECIMEN_MULTIPLIER = { daysToNext: 3 } as const

export const SPECIMEN_LEVEL = { level: 4, xpIntoLevel: 620, xpForLevel: 1000 } as const

export type SpecimenBadge = {
  id: string
  name: string
  detail: string
  unlocked: boolean
}

export const SPECIMEN_BADGES: readonly SpecimenBadge[] = [
  { id: 'h24', name: '24 heures', detail: 'J+1', unlocked: true },
  { id: 'd7', name: 'Une semaine', detail: 'J+7', unlocked: true },
  { id: 'step2', name: 'Palier 14 mg', detail: 'J+28', unlocked: false },
  { id: 'c25', name: '25 envies', detail: 'J+9', unlocked: true },
  { id: 'eur100', name: '100 €', detail: '62 %', unlocked: false },
  { id: 'y1', name: 'Un an', detail: 'J+365', unlocked: false },
]

export const SPECIMEN_BADGE_TOTAL = 12

export type ColorToken = { token: string; swatch: string; value: string; role: string }

export const COLOR_TOKENS: readonly ColorToken[] = [
  { token: 'page', swatch: 'bg-page', value: '#101012', role: 'Fond de page, texte sur crème' },
  { token: 'surface', swatch: 'bg-surface', value: '#17171a', role: 'Cartes, tiroirs, dialogues' },
  {
    token: 'ink',
    swatch: 'bg-ink',
    value: '#f7f4ef',
    role: 'Texte ; crème des boutons pleins et sélections',
  },
  {
    token: 'muted',
    swatch: 'bg-muted',
    value: '#a3a3a3',
    role: 'Texte secondaire, repères d’étape des graphiques',
  },
  {
    token: 'white',
    swatch: 'bg-white',
    value: '#ffffff',
    role: 'Le chiffre clé : streak et minuteur',
  },
  {
    token: 'line',
    swatch: 'bg-line',
    value: 'rgb(255 255 255 / 0.08)',
    role: 'Filets, pistes, contours',
  },
  {
    token: 'ghost',
    swatch: 'bg-ghost',
    value: 'rgb(255 255 255 / 0.05)',
    role: 'Puces, champs, appui',
  },
  {
    token: 'ghost-line',
    swatch: 'bg-ghost-line',
    value: 'rgb(255 255 255 / 0.36)',
    role: 'Filet du bouton fantôme et des champs (3:1), ligne de base des graphiques',
  },
  {
    token: 'alert',
    swatch: 'bg-alert',
    value: '#ff6b72',
    role: 'Erreurs et suppressions — 6,5:1 sur carte',
  },
  { token: 'amber', swatch: 'bg-amber', value: '#b8730f', role: 'Halo du héros' },
  { token: 'floor', swatch: 'bg-floor', value: '#3a1a10', role: 'Sol chaud du halo, en haut' },
  {
    token: 'floor-deep',
    swatch: 'bg-floor-deep',
    value: '#1c1011',
    role: 'Sol du halo, là où il rejoint la page',
  },
  { token: 'ember', swatch: 'bg-ember', value: '#8d2a1a', role: 'Halo du héros' },
  { token: 'plum', swatch: 'bg-plum', value: '#7a1b5f', role: 'Halo du héros' },
  { token: 'pink', swatch: 'bg-pink', value: '#fd429c', role: 'Dégradé d’Envie, et lui seul' },
  { token: 'yellow', swatch: 'bg-yellow', value: '#f5d907', role: 'Dégradé d’Envie, et lui seul' },
  { token: 'moss', swatch: 'bg-moss', value: '#33402c', role: 'Halo du minuteur d’envie' },
  { token: 'bronze', swatch: 'bg-bronze', value: '#b88a4f', role: 'Halo du minuteur d’envie' },
  {
    token: 'series',
    swatch: 'bg-series',
    value: '#d08a2a',
    role: 'Barres des graphiques — 6,3:1 sur carte, 3:1 estompées',
  },
]

export type TypeToken = {
  token: string
  className: string
  /** The sample is a figure: its units show at the `unit` size. */
  figure?: true
  px: string
  sample: string
  role: string
}

export const TYPE_TOKENS: readonly TypeToken[] = [
  {
    token: 'display',
    className: 'text-display',
    px: '62 cqi',
    sample: '12',
    role: 'Le streak et les minutes tenues : 62 % de la colonne',
  },
  {
    token: 'countdown',
    className: 'text-countdown',
    px: '33 cqi',
    sample: '3:42',
    role: 'Le compte à rebours du minuteur',
  },
  {
    token: 'brand',
    className: 'text-brand',
    px: '21 px',
    sample: 'quit',
    role: 'La marque, en haut à gauche',
  },
  {
    token: 'craving',
    className: 'text-craving',
    px: '16 px',
    sample: 'Envie',
    role: 'Le bouton Envie, seul : la taille de cta, en 600',
  },
  {
    token: 'figure',
    className: 'text-figure',
    px: '30 px',
    sample: '07 h 42 · 620 XP',
    role: 'Temps, XP, argent : chiffres tabulaires',
  },
  {
    token: 'headline',
    className: 'text-headline',
    px: '28 px',
    sample: strings.quitMoment.title,
    role: 'La question posée seule à l’écran, au premier lancement',
  },
  {
    token: 'prompt',
    className: 'text-prompt',
    px: '24 px',
    sample: strings.craving.timer.lead,
    role: 'La phrase du minuteur, au-dessus du compte à rebours',
  },
  {
    token: 'title',
    className: 'text-title',
    px: '20 px',
    sample: 'Patch du jour',
    role: 'Titres de carte, de tiroir et de dialogue',
  },
  {
    token: 'lead',
    className: 'text-lead',
    px: '18 px',
    sample: 'jours de streak · 07 h 42',
    role: 'La ligne sous le chiffre du streak',
  },
  {
    token: 'cta',
    className: 'text-cta',
    px: '16 px',
    sample: 'Poser le patch · 14 mg',
    role: 'Boutons en pilule, champs',
  },
  {
    token: 'body',
    className: 'text-body',
    px: '15 px',
    sample: 'Quatre minutes. Tiens le temps du timer.',
    role: 'Lecture — boutons, cartes, tout le reste',
  },
  {
    token: 'label',
    className: 'text-label',
    px: '13 px',
    sample: 'Étape 1 · 21 mg · J-16 avant 14 mg',
    role: 'Libellés, contexte, valeurs secondaires',
  },
  {
    token: 'detail',
    className: 'text-detail',
    px: '12 px',
    sample: 'J+28',
    role: 'Détail de badge',
  },
  {
    token: 'unit',
    className: 'text-figure',
    figure: true,
    px: '0,55 em',
    sample: '220,08\u00a0€',
    role: 'L’unité d’un chiffre (€, %, j, h), plus petite et estompée',
  },
  {
    token: 'tab',
    className: 'text-tab',
    px: '11 px',
    sample: 'Historique',
    role: 'Libellés de la barre d’onglets',
  },
]

export type RadiusToken = { token: string; className: string; value: string; role: string }

export const RADIUS_TOKENS: readonly RadiusToken[] = [
  {
    token: 'hero',
    className: 'rounded-hero',
    value: '1.75rem',
    role: 'Bord d’attaque des tiroirs',
  },
  { token: 'card', className: 'rounded-card', value: '0.75rem', role: 'Cartes, dialogues' },
  { token: 'control', className: 'rounded-control', value: '0.625rem', role: 'Champs' },
  {
    token: 'step',
    className: 'rounded-step',
    value: '0.5rem',
    role: 'Crans, pastilles de couleur',
  },
  { token: 'mark', className: 'rounded-mark', value: '0.25rem', role: 'Barres de graphique' },
]

const design = strings.design

export const SPECIMEN_SWITCHES = [
  { label: design.switchLabel, checked: true, disabled: false },
  { label: design.switchOffLabel, checked: false, disabled: false },
  { label: design.switchDisabledLabel, checked: false, disabled: true },
] as const

/** The text field empty, filled, refused with its alert, and disabled. */
export const SPECIMEN_FIELDS = [
  { id: 'empty', label: design.fields.label, placeholder: design.fields.placeholder },
  { id: 'filled', label: design.fields.price, value: design.fields.priceValue },
  {
    id: 'invalid',
    label: design.fields.invalid,
    value: design.fields.invalidValue,
    error: design.fields.error,
  },
  {
    id: 'disabled',
    label: design.fields.disabled,
    value: design.fields.disabledValue,
    disabled: true,
  },
] as const
