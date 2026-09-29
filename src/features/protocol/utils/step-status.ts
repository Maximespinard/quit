import type { ProtocolPosition } from '@/shared/domain/protocol-position'

/** Where a step of the protocol in force stands today; a step added in the editor is upcoming. */
export type StepStatus = 'past' | 'current' | 'upcoming'

/**
 * Reads the status of a draft from the protocol in force, never from the draft: a draft's id is
 * its step's index in force (`draftsFrom`), so the marker stays put while the steps are edited.
 */
export function stepStatus(
  position: ProtocolPosition | null,
  draftId: number,
  stepsInForce: number,
): StepStatus {
  if (position === null || draftId >= stepsInForce) return 'upcoming'
  if (position.status === 'over') return 'past'
  const current = position.stepNumber - 1
  if (draftId < current) return 'past'
  return draftId === current ? 'current' : 'upcoming'
}
