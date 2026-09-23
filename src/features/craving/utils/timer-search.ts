/** The running timer lives in the url: a reload or a return from the background keeps its start. */
export type CravingTimerSearch = {
  readonly startedAt?: number
  /** Set when the user stopped the timer before its end. */
  readonly stoppedAt?: number
}

const isInstant = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export function validateCravingTimerSearch(search: Record<string, unknown>): CravingTimerSearch {
  const { startedAt, stoppedAt } = search
  return {
    ...(isInstant(startedAt) ? { startedAt } : {}),
    ...(isInstant(stoppedAt) ? { stoppedAt } : {}),
  }
}
