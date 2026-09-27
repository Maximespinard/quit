import type { Journal } from '../journal'
export const QUIT_MOMENT = 'quit-moment' as const

/** The exact timestamp (ms since epoch) at which the user stopped smoking. */
export type QuitMomentFact = {
  readonly type: typeof QUIT_MOMENT
  readonly at: number
}

export const quitMomentModule = {
  type: QUIT_MOMENT,
  /** Turns a stored value back into a fact, or `null` when it is not one. */
  decode(raw: unknown): QuitMomentFact | null {
    if (typeof raw !== 'object' || raw === null) return null
    const { type, at } = raw as { type?: unknown; at?: unknown }
    if (type !== QUIT_MOMENT || typeof at !== 'number' || !Number.isFinite(at)) return null
    return { type: QUIT_MOMENT, at }
  },
}

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

/** Records the quit moment, or its correction: the latest one recorded is in force. */
export function recordQuitMoment(
  journal: Journal,
  at: number,
  now: number,
): RecordQuitMomentResult {
  const refusal = quitMomentRefusal(journal, at, now)
  if (refusal !== null) return { ok: false, ...refusal }
  return { ok: true, journal: { ...journal, facts: [...journal.facts, { type: QUIT_MOMENT, at }] } }
}
