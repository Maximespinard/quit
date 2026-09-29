import type { Protocol } from '@quit/contract/settings'
import { localMidnight } from './local-day'
import { plannedEnd } from './protocol-position'

/** The local calendar days the protocol opens and closes on, each as its local midnight. */
export type PatchDays = {
  /** The day holding the quit moment. */
  readonly quitDay: number
  /** The day the last step ends on: the last patch comes off. */
  readonly endDay: number
}

export const patchDays = (protocol: Protocol, quitMoment: number): PatchDays => ({
  quitDay: localMidnight(quitMoment),
  endDay: localMidnight(plannedEnd(protocol, quitMoment)),
})

/**
 * One patch application is expected per local calendar day of the protocol, the quit day and
 * the end day excepted: a patch put on before the quit moment cannot be recorded, and the last
 * one comes off on the end day. The calendar and the home's patch of the day both ask here,
 * so they always agree on today.
 */
export const asksForPatch = (day: number, { quitDay, endDay }: PatchDays): boolean =>
  day > quitDay && day < endDay
