import { DAY_MS } from '@/shared/utils/duration'
import type { Protocol, Step } from './protocol'

/** Where the taper stands: a step and a day within it, or past the last step. */
export type ProtocolPosition =
  | {
      readonly status: 'running'
      /** 1-based, like the copy shows it. */
      readonly stepNumber: number
      readonly stepCount: number
      readonly step: Step
      /** 1 on the step's first day. */
      readonly dayInStep: number
      /** Days until the next step (or the end) begins, today included: 1 on the step's last day. */
      readonly daysLeft: number
      /** The instant the step ends: the next one, or the end of the protocol, begins there. */
      readonly endsAt: number
      readonly nextStep: Step | null
    }
  | { readonly status: 'over' }

/**
 * Which 24 h block since the quit moment `now` falls in, 0 for the first: a protocol day.
 * `now` before the quit moment waits on day 0.
 */
export const protocolDayIndex = (quitMoment: number, now: number) =>
  Math.floor(Math.max(0, now - quitMoment) / DAY_MS)

/**
 * The protocol starts at the quit moment and runs in whole 24 h blocks from it; every patch
 * is a 24 h patch. Only reachable through `derive`, and the patch calendar that shows it.
 */
export function protocolPosition(
  protocol: Protocol,
  quitMoment: number,
  now: number,
): ProtocolPosition {
  const dayIndex = protocolDayIndex(quitMoment, now)
  let stepStart = 0
  for (const [index, step] of protocol.entries()) {
    const stepEnd = stepStart + step.durationDays
    if (dayIndex < stepEnd) {
      return {
        status: 'running',
        stepNumber: index + 1,
        stepCount: protocol.length,
        step,
        dayInStep: dayIndex - stepStart + 1,
        daysLeft: stepEnd - dayIndex,
        endsAt: quitMoment + stepEnd * DAY_MS,
        nextStep: protocol[index + 1] ?? null,
      }
    }
    stepStart = stepEnd
  }
  return { status: 'over' }
}
