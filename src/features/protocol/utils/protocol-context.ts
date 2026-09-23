import type { ProtocolPosition } from '@/shared/domain/protocol-position'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

/** The hero's top-right context: the current step and its dose, or the end of the taper. */
export function protocolContext(position: ProtocolPosition): string {
  if (position.status === 'over') return strings.protocol.over
  return strings.protocol.context(position.stepNumber, formatDose(position.step.doseMg))
}
