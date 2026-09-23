import { MINUTE_MS, SECOND_MS } from '@/shared/utils/duration'
import { twoDigits } from '@/shared/utils/format'

const SECONDS_PER_MINUTE = MINUTE_MS / SECOND_MS

/** Formats a remaining time as `m:ss`, rounding up so the last second still reads `0:01`. */
export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / SECOND_MS)
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  return `${minutes}:${twoDigits(totalSeconds % SECONDS_PER_MINUTE)}`
}
