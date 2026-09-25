import { latestQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { type PatchToday, patchToday } from './patch-today'
import { type ProtocolPosition, protocolPosition } from './protocol-position'

export type Streak = {
  /** Time elapsed since the quit moment, in ms. Only the display layer divides it. */
  readonly elapsedMs: number
}

/**
 * Without a quit moment nothing is derived; with one, the streak, the protocol position and
 * today's patch always exist.
 */
export type DerivedState =
  | {
      readonly quitMoment: null
      readonly streak: null
      readonly protocol: null
      readonly patch: null
    }
  | {
      readonly quitMoment: number
      readonly streak: Streak
      readonly protocol: ProtocolPosition
      readonly patch: PatchToday
    }

/**
 * The single derivation entry point: facts in, state out. `now` is always injected (ADR-0002).
 * `now` can sit before the quit moment (a moved sandbox clock): the streak waits at zero.
 */
export function derive(journal: Journal, now: number): DerivedState {
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null) return { quitMoment: null, streak: null, protocol: null, patch: null }
  const protocol = protocolPosition(journal.protocol, quitMoment, now)
  return {
    quitMoment,
    streak: { elapsedMs: Math.max(0, now - quitMoment) },
    protocol,
    patch: patchToday(journal, quitMoment, protocol, now),
  }
}
