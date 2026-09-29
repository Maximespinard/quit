import { DAY_MS } from '@/shared/utils/duration'
import { lapsesUntil } from './facts/lapse'
import type { Journal } from './journal'

const WEEK_MS = 7 * DAY_MS

/** The goal as the home shows it: what is saved towards it, and whether the price is met. */
export type GoalProgress = {
  readonly label: string
  readonly priceCents: number
  /** Money saved since the goal started counting, never below zero; may pass the price. */
  readonly savedCents: number
  /** The price met, or met once and celebrated: then it stays reached. */
  readonly reached: boolean
  /** Whether the celebration of the goal reached was already seen. */
  readonly celebrated: boolean
}

const cigarettesSmokedUntil = (journal: Journal, quitMoment: number, until: number) =>
  lapsesUntil(journal, quitMoment, until).reduce((total, lapse) => total + lapse.count, 0)

// Whole ms: `BigInt` refuses a fraction, and a moved clock is not bound to whole ones.
const elapsedSince = (quitMoment: number, until: number) =>
  Math.max(0, Math.trunc(until - quitMoment))

/**
 * Money saved from the quit moment to `until`, in whole cents rounded down: the weekly spend,
 * gross, pro rata of the time elapsed, minus every cigarette smoked in a lapse priced from the
 * baseline. Never below zero. `null` without the spend, or without the baseline that prices
 * a cigarette.
 */
export function moneySavedCents(
  journal: Journal,
  quitMoment: number,
  until: number,
): number | null {
  const { weeklySpendCents, baselineSmokesPerDay } = journal
  if (weeklySpendCents === null || baselineSmokesPerDay === null) return null
  const smoked = cigarettesSmokedUntil(journal, quitMoment, until)
  // spend × (elapsed / week − smoked / cigarettes a week), as one exact fraction: a double's
  // integers run out within a year of milliseconds times cents times cigarettes.
  const perWeek = BigInt(7 * baselineSmokesPerDay)
  const numerator =
    BigInt(weeklySpendCents) *
    (BigInt(elapsedSince(quitMoment, until)) * perWeek - BigInt(smoked) * BigInt(WEEK_MS))
  return numerator <= 0n ? 0 : Number(numerator / (BigInt(WEEK_MS) * perWeek))
}

/**
 * The cigarettes the baseline would have had smoked since the quit moment, whole ones only,
 * minus every cigarette smoked in a lapse. Never below zero; `null` without the baseline.
 */
export function cigarettesNotSmoked(
  journal: Journal,
  quitMoment: number,
  now: number,
): number | null {
  const { baselineSmokesPerDay } = journal
  if (baselineSmokesPerDay === null) return null
  const wouldHaveSmoked = Math.floor(
    (baselineSmokesPerDay * elapsedSince(quitMoment, now)) / DAY_MS,
  )
  return Math.max(0, wouldHaveSmoked - cigarettesSmokedUntil(journal, quitMoment, now))
}

/**
 * The goal set, measured against the money saved since it started counting: the quit moment,
 * or the moment it replaced a goal reached. `null` without a goal or without money saved.
 */
export function goalProgress(
  journal: Journal,
  quitMoment: number,
  now: number,
): GoalProgress | null {
  const { goal } = journal
  if (goal === null) return null
  const saved = moneySavedCents(journal, quitMoment, now)
  if (saved === null) return null
  const before =
    goal.countsFrom === null ? 0 : (moneySavedCents(journal, quitMoment, goal.countsFrom) ?? 0)
  const savedCents = Math.max(0, saved - before)
  return {
    label: goal.label,
    priceCents: goal.priceCents,
    savedCents,
    // Once seen reached, it stays so: the money went on it, whatever a later edit subtracts.
    reached: goal.celebrated || savedCents >= goal.priceCents,
    celebrated: goal.celebrated,
  }
}
