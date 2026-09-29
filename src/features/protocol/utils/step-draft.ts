import type { Step } from '@quit/contract/settings'
import { fromDecimalText, toDecimalText } from '@/shared/utils/decimal-text'

/** A step as the editor holds it: raw field text, with a stable id for list keys. */
export type StepDraft = {
  readonly id: number
  readonly dose: string
  readonly duration: string
  readonly brand: string
}

/** The editable fields of a step draft. */
export type DraftField = Exclude<keyof StepDraft, 'id'>

export const draftsFrom = (steps: readonly Step[]): StepDraft[] =>
  steps.map((step, id) => ({
    id,
    dose: toDecimalText(step.doseMg),
    duration: toDecimalText(step.durationDays),
    brand: step.brand ?? '',
  }))

/** Validation is the domain's job (`setProtocol`): this only reads the text. */
export const stepFrom = (draft: StepDraft): Step => ({
  doseMg: fromDecimalText(draft.dose),
  durationDays: fromDecimalText(draft.duration),
  brand: draft.brand,
})

/** Moves one draft by `offset` places; past either end the list is returned untouched. */
export function moveDraft(
  drafts: readonly StepDraft[],
  index: number,
  offset: -1 | 1,
): readonly StepDraft[] {
  const target = index + offset
  const moved = drafts[index]
  const displaced = drafts[target]
  if (moved === undefined || displaced === undefined) return drafts
  const next = [...drafts]
  next[index] = displaced
  next[target] = moved
  return next
}
