import type { Journal } from '../journal'
import { latestQuitMoment } from './quit-moment'

export const LAPSE = 'lapse' as const

/**
 * Any smoke inhaled after the quit moment, as one episode. No threshold: one puff is a lapse.
 * `count` is the number of cigarettes it held, one by default.
 */
export type LapseFact = {
  readonly type: typeof LAPSE
  readonly at: number
  readonly count: number
}

export type Lapse = Omit<LapseFact, 'type'>

const isValidCount = (count: number): boolean => Number.isInteger(count) && count >= 1

export const lapseModule = {
  type: LAPSE,
  /**
   * Turns a stored value back into a fact, or `null` when it is not one. A lapse stored
   * before it had a count reads as one cigarette: no migration.
   */
  decode(raw: unknown): LapseFact | null {
    if (typeof raw !== 'object' || raw === null) return null
    const { type, at, count = 1 } = raw as Record<string, unknown>
    if (type !== LAPSE || typeof at !== 'number' || !Number.isFinite(at)) return null
    if (typeof count !== 'number' || !isValidCount(count)) return null
    return { type: LAPSE, at, count }
  },
}

export type RecordLapseResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'future' | 'before-quit-moment' | 'invalid-count' }

/**
 * Records a lapse. Refused without a whole number of cigarettes, after `now` (nothing
 * happened yet) and before the quit moment (smoking then was not a lapse) — so also while
 * no quit moment exists.
 */
export function recordLapse(journal: Journal, lapse: Lapse, now: number): RecordLapseResult {
  if (!isValidCount(lapse.count)) return { ok: false, reason: 'invalid-count' }
  if (lapse.at > now) return { ok: false, reason: 'future' }
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null || lapse.at < quitMoment)
    return { ok: false, reason: 'before-quit-moment' }
  return { ok: true, journal: { ...journal, facts: [...journal.facts, { type: LAPSE, ...lapse }] } }
}

/**
 * The lapses that count at `now`, oldest first: at or after the quit moment (earlier ones
 * predate a corrected quit moment) and not after `now` (not happened yet on a moved clock).
 */
export function lapsesUntil(journal: Journal, quitMoment: number, now: number): Lapse[] {
  return journal.facts
    .flatMap((fact) =>
      fact.type === LAPSE && fact.at >= quitMoment && fact.at <= now
        ? [{ at: fact.at, count: fact.count }]
        : [],
    )
    .sort((a, b) => a.at - b.at)
}
