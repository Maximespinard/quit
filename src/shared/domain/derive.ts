import { QUIT_MOMENT } from './facts/quit-moment'
import type { Journal } from './journal'
import { type ProtocolPosition, protocolPosition } from './protocol-position'

export type Streak = {
  /** Time elapsed since the quit moment, in ms. Only the display layer divides it. */
  readonly elapsedMs: number
}

/** Without a quit moment nothing is derived; with one, the streak and the protocol position always exist. */
export type DerivedState =
  | { readonly quitMoment: null; readonly streak: null; readonly protocol: null }
  | {
      readonly quitMoment: number
      readonly streak: Streak
      readonly protocol: ProtocolPosition
    }

/**
 * The single derivation entry point: facts in, state out. `now` is always injected (ADR-0002).
 * `now` can sit before the quit moment (a moved sandbox clock): the streak waits at zero.
 */
export function derive(journal: Journal, now: number): DerivedState {
  const quitMoment = journal.facts.findLast((fact) => fact.type === QUIT_MOMENT)?.at ?? null
  if (quitMoment === null) return { quitMoment: null, streak: null, protocol: null }
  return {
    quitMoment,
    streak: { elapsedMs: Math.max(0, now - quitMoment) },
    protocol: protocolPosition(journal.protocol, quitMoment, now),
  }
}
