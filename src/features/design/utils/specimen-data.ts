import type { SplitDuration } from '@/shared/utils/duration'

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

export type ColorToken = { token: string; swatch: string; hex: string; role: string }

export const COLOR_TOKENS: readonly ColorToken[] = [
  { token: 'page', swatch: 'bg-page', hex: '#fafafa', role: 'Fond de page' },
  { token: 'ink', swatch: 'bg-ink', hex: '#1b3c53', role: 'Texte, bloc héros, état acquis' },
  {
    token: 'ink-soft',
    swatch: 'bg-ink-soft',
    hex: '#5e6c78',
    role: 'Texte secondaire sur la page',
  },
  {
    token: 'ink-dim',
    swatch: 'bg-ink-dim',
    hex: '#4a5a66',
    role: 'Texte secondaire sur surface teintée',
  },
  { token: 'on-ink', swatch: 'bg-on-ink', hex: '#e3e3e3', role: 'Texte sur le bloc héros' },
  {
    token: 'action',
    swatch: 'bg-action',
    hex: '#234c6a',
    role: 'Envie, remplissage XP, onglet actif, bouton principal',
  },
  {
    token: 'reached',
    swatch: 'bg-reached',
    hex: '#456882',
    role: 'Cran de multiplicateur courant',
  },
  { token: 'surface', swatch: 'bg-surface', hex: '#e3e3e3', role: 'Cartes, plateaux' },
  {
    token: 'surface-locked',
    swatch: 'bg-surface-locked',
    hex: '#d4d4d4',
    role: 'Badge verrouillé',
  },
  { token: 'line', swatch: 'bg-line', hex: '#d4d4d4', role: 'Filets, pistes, contours' },
  { token: 'alert', swatch: 'bg-alert', hex: '#a6392f', role: 'Erreurs et suppressions' },
]

export type TypeToken = {
  token: string
  className: string
  px: string
  sample: string
  role: string
}

export const TYPE_TOKENS: readonly TypeToken[] = [
  {
    token: 'display',
    className: 'text-display',
    px: '176 px',
    sample: '12',
    role: 'Le chiffre du streak, et lui seul',
  },
  {
    token: 'figure',
    className: 'text-figure',
    px: '22 px',
    sample: '07 h 42 · 620 XP',
    role: 'Temps, XP, argent : chiffres tabulaires',
  },
  {
    token: 'title',
    className: 'text-title',
    px: '19 px',
    sample: 'Poser le patch',
    role: 'Titres de tiroir et de boîte de dialogue',
  },
  { token: 'cta', className: 'text-cta', px: '17 px', sample: 'Envie', role: 'Le bouton Envie' },
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
    px: '11 px',
    sample: 'J+28',
    role: 'Détail de badge',
  },
  {
    token: 'tab',
    className: 'text-tab',
    px: '10,5 px',
    sample: 'Historique',
    role: 'Libellés de la barre d’onglets',
  },
]
