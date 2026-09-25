/** Local midnight opening the calendar day `offset` days after the one holding `at`. */
const localMidnight = (at: number, offset = 0): number => {
  const date = new Date(at)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset).getTime()
}

/**
 * Whole local calendar days, over by `now`, lying entirely at or after the quit moment and
 * holding no lapse. The quit day only counts when the quit moment opens it: before that
 * instant it had smoke. Days are walked on the calendar, never in 24 h blocks, so a
 * daylight-saving change keeps each day whole.
 */
export function smokeFreeDays(quitMoment: number, lapses: readonly number[], now: number): number {
  const lapseDays = new Set(lapses.map((at) => localMidnight(at)))
  let count = 0
  let dayStart =
    localMidnight(quitMoment) === quitMoment ? quitMoment : localMidnight(quitMoment, 1)
  for (let next = localMidnight(dayStart, 1); next <= now; next = localMidnight(dayStart, 1)) {
    if (!lapseDays.has(dayStart)) count += 1
    dayStart = next
  }
  return count
}
