import type { Journal } from './journal'

/** Integer cents, above zero: money saved is computed from it. */
export const isValidWeeklySpend = (cents: number) => Number.isInteger(cents) && cents > 0

/** Whole smokes, at least one a day: cigarettes not smoked are counted from it. */
export const isValidBaseline = (perDay: number) => Number.isInteger(perDay) && perDay > 0

export type SetWeeklySpendResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'invalid-spend' }

/** Replaces the weekly tobacco spend, at any time. Only the display layer turns it into euros. */
export function setWeeklySpend(journal: Journal, cents: number): SetWeeklySpendResult {
  if (!isValidWeeklySpend(cents)) return { ok: false, reason: 'invalid-spend' }
  return { ok: true, journal: { ...journal, weeklySpendCents: cents } }
}

export type SetBaselineResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'invalid-baseline' }

/** Replaces the baseline smokes per day, at any time. */
export function setBaselineSmokesPerDay(journal: Journal, perDay: number): SetBaselineResult {
  if (!isValidBaseline(perDay)) return { ok: false, reason: 'invalid-baseline' }
  return { ok: true, journal: { ...journal, baselineSmokesPerDay: perDay } }
}
