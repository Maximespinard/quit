export const SECOND_MS = 1_000
export const MINUTE_MS = 60 * SECOND_MS
export const HOUR_MS = 60 * MINUTE_MS
export const DAY_MS = 24 * HOUR_MS

export type SplitDuration = {
  readonly days: number
  readonly hours: number
  readonly minutes: number
  readonly seconds: number
}

/** Display-side split of a duration: the domain keeps durations as one ms scalar. */
export function splitDuration(ms: number): SplitDuration {
  const days = Math.floor(ms / DAY_MS)
  const hours = Math.floor((ms % DAY_MS) / HOUR_MS)
  const minutes = Math.floor((ms % HOUR_MS) / MINUTE_MS)
  const seconds = Math.floor((ms % MINUTE_MS) / SECOND_MS)
  return { days, hours, minutes, seconds }
}
