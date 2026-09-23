import { MINUTE_MS } from '@/shared/utils/duration'

/** How long the craving timer runs: a craving peaks and passes within a few minutes. */
export const CRAVING_TIMER_MS = 4 * MINUTE_MS

export type CravingTimer = {
  /** Time left, in ms, between 0 and the full duration. */
  readonly remainingMs: number
  readonly finished: boolean
}

/**
 * The timer as a pure function of its start instant and `now` (ADR-0002): nothing ticks in
 * the background, so a timer left while the app slept reads right on return.
 * `now` before the start (a moved sandbox clock) waits at the full duration.
 */
export function cravingTimer(startedAt: number, now: number): CravingTimer {
  const elapsedMs = Math.max(0, now - startedAt)
  const remainingMs = Math.max(0, CRAVING_TIMER_MS - elapsedMs)
  return { remainingMs, finished: remainingMs === 0 }
}
