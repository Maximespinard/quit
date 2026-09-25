import type { Lapse } from './facts/lapse'
import { localMidnight } from './local-day'

/**
 * Whole local calendar days, over by `now`, lying entirely at or after the quit moment and
 * holding no lapse. The quit day only counts when the quit moment opens it: before that
 * instant it had smoke. Days are walked on the calendar, never in 24 h blocks, so a
 * daylight-saving change keeps each day whole.
 */
export function smokeFreeDays(quitMoment: number, lapses: readonly Lapse[], now: number): number {
  const lapseDays = new Set(lapses.map((lapse) => localMidnight(lapse.at)))
  let count = 0
  let dayStart =
    localMidnight(quitMoment) === quitMoment ? quitMoment : localMidnight(quitMoment, 1)
  for (let next = localMidnight(dayStart, 1); next <= now; next = localMidnight(dayStart, 1)) {
    if (!lapseDays.has(dayStart)) count += 1
    dayStart = next
  }
  return count
}
