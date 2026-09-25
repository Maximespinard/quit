import { lapsesUntil } from './facts/lapse'
import { latestQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { type ProtocolDayPatch, protocolDayPatch } from './protocol-day-patch'
import { type ProtocolPosition, protocolPosition } from './protocol-position'
import { smokeFreeDays } from './smoke-free-days'
import { type Streak, streaks } from './streak'

export type { Streak }

/**
 * Without a quit moment nothing is derived; with one, every figure but the personal best exists.
 */
export type DerivedState =
  | {
      readonly quitMoment: null
      readonly streak: null
      readonly personalBest: null
      readonly smokeFreeDays: null
      readonly protocol: null
      readonly patch: null
    }
  | {
      readonly quitMoment: number
      readonly streak: Streak
      /** The longest streak ever held, shown only once a lapse exists. */
      readonly personalBest: Streak | null
      /** Never resets: a lapse only takes away the calendar day it happened on. */
      readonly smokeFreeDays: number
      readonly protocol: ProtocolPosition
      readonly patch: ProtocolDayPatch
    }

/**
 * The single derivation entry point: facts in, state out. `now` is always injected (ADR-0002).
 * `now` can sit before the quit moment (a moved sandbox clock): the streak waits at zero.
 */
export function derive(journal: Journal, now: number): DerivedState {
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null) {
    return {
      quitMoment: null,
      streak: null,
      personalBest: null,
      smokeFreeDays: null,
      protocol: null,
      patch: null,
    }
  }
  const lapses = lapsesUntil(journal, quitMoment, now)
  // A lapse never alters the protocol: its position follows the quit moment alone.
  const protocol = protocolPosition(journal.protocol, quitMoment, now)
  return {
    quitMoment,
    ...streaks(quitMoment, lapses, now),
    smokeFreeDays: smokeFreeDays(quitMoment, lapses, now),
    protocol,
    patch: protocolDayPatch(journal, quitMoment, protocol, now),
  }
}
