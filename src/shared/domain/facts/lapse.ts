import { LAPSE, type LapseFact, lapseCountSchema } from '@quit/contract/facts'
import type { Journal } from '../journal'
import { latestQuitMoment } from './quit-moment'

/** A lapse as the user reports it: when, and how many cigarettes it held. */
export type Lapse = Omit<LapseFact, 'type'>

const isValidCount = (count: number): boolean => lapseCountSchema.safeParse(count).success

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
