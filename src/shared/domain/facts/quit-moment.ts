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

export type RecordQuitMomentResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'future' }

/** Records the quit moment. A moment after `now` is refused: nothing happened yet. */
export function recordQuitMoment(
  journal: Journal,
  at: number,
  now: number,
): RecordQuitMomentResult {
  if (at > now) return { ok: false, reason: 'future' }
  return { ok: true, journal: { ...journal, facts: [...journal.facts, { type: QUIT_MOMENT, at }] } }
}
