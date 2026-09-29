import { type FactId, QUIT_MOMENT } from '@quit/contract/facts'
import type { Journal } from '../journal'

/** The quit moment in force: the latest one recorded, a correction replacing the earlier. */
export function latestQuitMoment(journal: Journal): number | null {
  return journal.facts.findLast((fact) => fact.type === QUIT_MOMENT)?.at ?? null
}

export type QuitMomentRefusal =
  | { readonly reason: 'future' }
  /** `earliestFact`: the first fact the moment would leave before it. */
  | { readonly reason: 'after-facts'; readonly earliestFact: number }

export type RecordQuitMomentResult =
  | { readonly ok: true; readonly journal: Journal }
  | ({ readonly ok: false } & QuitMomentRefusal)

/** The earliest fact other than a quit moment, or `null` when there is none. */
function earliestFact(journal: Journal): number | null {
  const times = journal.facts.flatMap((fact) => (fact.type === QUIT_MOMENT ? [] : [fact.at]))
  return times.length === 0 ? null : Math.min(...times)
}

/**
 * Why a quit moment cannot be recorded, or `null` when it can. After `now` nothing happened
 * yet; after a fact already recorded, that fact would predate the journey it belongs to.
 */
export function quitMomentRefusal(
  journal: Journal,
  at: number,
  now: number,
): QuitMomentRefusal | null {
  if (at > now) return { reason: 'future' }
  const earliest = earliestFact(journal)
  if (earliest !== null && at > earliest) return { reason: 'after-facts', earliestFact: earliest }
  return null
}

/**
 * Records the quit moment, or its correction: the latest one recorded is in force. A
 * correction is the same fact, recorded again last under its id; a quit moment left before
 * it by an earlier correction stays as it was. Only a first quit moment takes an id from `newId`.
 */
export function recordQuitMoment(
  journal: Journal,
  at: number,
  now: number,
  newId: () => FactId,
): RecordQuitMomentResult {
  const refusal = quitMomentRefusal(journal, at, now)
  if (refusal !== null) return { ok: false, ...refusal }
  const index = journal.facts.findLastIndex((fact) => fact.type === QUIT_MOMENT)
  const id = journal.facts[index]?.id ?? newId()
  const others = index === -1 ? journal.facts : journal.facts.toSpliced(index, 1)
  return { ok: true, journal: { ...journal, facts: [...others, { type: QUIT_MOMENT, id, at }] } }
}
