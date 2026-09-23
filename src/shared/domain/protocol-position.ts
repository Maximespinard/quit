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
      readonly nextStep: Step | null
    }
  | { readonly status: 'over' }

/**
 * The protocol starts at the quit moment and runs in whole 24 h blocks from it; every patch
 * is a 24 h patch. Only reachable through `derive`.
 */
export function protocolPosition(
  protocol: Protocol,
  quitMoment: number,
  now: number,
): ProtocolPosition {
  const dayIndex = Math.floor(Math.max(0, now - quitMoment) / DAY_MS)
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
        nextStep: protocol[index + 1] ?? null,
      }
    }
    stepStart = stepEnd
  }
  return { status: 'over' }
}
