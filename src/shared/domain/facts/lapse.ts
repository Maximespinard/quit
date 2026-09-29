import { LAPSE, type LapseFact, lapseCountSchema } from '@quit/contract/facts'
import type { Journal, JournalOutcome } from '../journal'
import { latestQuitMoment } from './quit-moment'

/** A lapse as the user reports it: when, and how many cigarettes it held. */
export type Lapse = Omit<LapseFact, 'type' | 'id'>

/** A lapse to record: a new one under a new id, a corrected one under its own. */
export type LapseInput = Omit<LapseFact, 'type'>

const isValidCount = (count: number): boolean => lapseCountSchema.safeParse(count).success

type LapseRefusal = 'future' | 'before-quit-moment' | 'invalid-count'

/**
 * Why a lapse cannot be recorded, or `null` when it can: without a whole number of
 * cigarettes, after `now` (nothing happened yet) and before the quit moment (smoking then was
 * not a lapse) — so also while no quit moment exists.
 */
export function lapseRefusal(journal: Journal, lapse: Lapse, now: number): LapseRefusal | null {
  if (!isValidCount(lapse.count)) return 'invalid-count'
  if (lapse.at > now) return 'future'
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null || lapse.at < quitMoment) return 'before-quit-moment'
  return null
}

/** Records a lapse, unless {@link lapseRefusal} refuses it. */
export function recordLapse(
  journal: Journal,
  lapse: LapseInput,
  now: number,
): JournalOutcome<LapseRefusal> {
  const reason = lapseRefusal(journal, lapse, now)
  if (reason !== null) return { ok: false, reason }
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
