import { lapsesUntil } from './facts/lapse'
import { latestQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { localMidnight } from './local-day'
import { type ProtocolDayPatch, protocolDayPatch } from './protocol-day-patch'
import { type ProtocolPosition, protocolPosition } from './protocol-position'
import { lapseRuns, type Relapse, relapsesOf } from './relapse'
import { smokeFreeDays } from './smoke-free-days'
import { type Streak, streaks } from './streak'

export type { Relapse, Streak }

/**
 * Without a quit moment nothing is derived; with one, every figure exists, the personal best
 * and the last cigarette only once there is something to show.
 */
export type DerivedState =
  | {
      readonly quitMoment: null
      readonly streak: null
      readonly personalBest: null
      readonly lastCigarette: null
      readonly lapseDaysInARow: null
      readonly relapses: null
      readonly cigarettesSmoked: null
      readonly smokeFreeDays: null
      readonly protocol: null
      readonly patch: null
    }
  | {
      readonly quitMoment: number
      /** Since the latest relapse, or the quit moment. A slip leaves it running. */
      readonly streak: Streak
      /** The longest streak ever held, shown only once a relapse exists. */
      readonly personalBest: Streak | null
      /** Since the latest lapse, while it is a slip; `null` otherwise. Drives nothing. */
      readonly lastCigarette: Streak | null
      /** Calendar days in a row holding a lapse, up to today or yesterday: the run still open. */
      readonly lapseDaysInARow: number
      /** Oldest first. The streak multiplier and the level key on them (XP, later). */
      readonly relapses: readonly Relapse[]
      /** Every lapse's cigarettes: money saved and cigarettes not smoked subtract them. */
      readonly cigarettesSmoked: number
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
      lastCigarette: null,
      lapseDaysInARow: null,
      relapses: null,
      cigarettesSmoked: null,
      smokeFreeDays: null,
      protocol: null,
      patch: null,
    }
  }
  const lapses = lapsesUntil(journal, quitMoment, now)
  const runs = lapseRuns(lapses)
  const relapses = relapsesOf(runs)
  const latestRun = runs.at(-1)
  const openRun =
    latestRun !== undefined && latestRun.lastDay >= localMidnight(now, -1) ? latestRun : null
  // A lapse never alters the protocol: its position follows the quit moment alone.
  const protocol = protocolPosition(journal.protocol, quitMoment, now)
  return {
    quitMoment,
    ...streaks(
      quitMoment,
      relapses.map((relapse) => relapse.at),
      now,
    ),
    lastCigarette:
      latestRun === undefined || latestRun.latest === relapses.at(-1)?.at
        ? null
        : { elapsedMs: now - latestRun.latest },
    lapseDaysInARow: openRun?.days ?? 0,
    relapses,
    cigarettesSmoked: lapses.reduce((total, lapse) => total + lapse.count, 0),
    smokeFreeDays: smokeFreeDays(
      quitMoment,
      lapses.map((lapse) => lapse.at),
      now,
    ),
    protocol,
    patch: protocolDayPatch(journal, quitMoment, protocol, now),
  }
}
