import { baselineSmokesPerDaySchema, weeklySpendCentsSchema } from '@quit/contract/settings'
import type { Journal, JournalOutcome } from '@/shared/domain/journal'

/** Integer cents, above zero: money saved is computed from it. */
export const isValidWeeklySpend = (cents: number) => weeklySpendCentsSchema.safeParse(cents).success

/** Whole smokes, at least one a day: cigarettes not smoked are counted from it. */
export const isValidBaseline = (perDay: number) =>
  baselineSmokesPerDaySchema.safeParse(perDay).success

/** Replaces the weekly tobacco spend, at any time. Only the display layer turns it into euros. */
export function setWeeklySpend(journal: Journal, cents: number): JournalOutcome<'invalid-spend'> {
  if (!isValidWeeklySpend(cents)) return { ok: false, reason: 'invalid-spend' }
  return { ok: true, journal: { ...journal, weeklySpendCents: cents } }
}

/** Replaces the baseline smokes per day, at any time. */
export function setBaselineSmokesPerDay(
  journal: Journal,
  perDay: number,
): JournalOutcome<'invalid-baseline'> {
  if (!isValidBaseline(perDay)) return { ok: false, reason: 'invalid-baseline' }
  return { ok: true, journal: { ...journal, baselineSmokesPerDay: perDay } }
}
