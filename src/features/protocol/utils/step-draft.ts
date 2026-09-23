import type { Step } from '@/shared/domain/protocol'

/** A step as the editor holds it: raw field text, with a stable id for list keys. */
export type StepDraft = {
  readonly id: number
  readonly dose: string
  readonly duration: string
  readonly brand: string
}

/** The editable fields of a step draft. */
export type DraftField = Exclude<keyof StepDraft, 'id'>

const toText = (value: number) => String(value).replace('.', ',')

/** Accepts the French decimal comma. Blank reads as 0 and garbage as NaN: the domain refuses both. */
const toNumber = (text: string) => Number(text.trim().replace(',', '.'))

export const draftsFrom = (steps: readonly Step[]): StepDraft[] =>
  steps.map((step, id) => ({
    id,
    dose: toText(step.doseMg),
    duration: toText(step.durationDays),
    brand: step.brand ?? '',
  }))

/** Validation is the domain's job (`setProtocol`): this only reads the text. */
export const stepFrom = (draft: StepDraft): Step => ({
  doseMg: toNumber(draft.dose),
  durationDays: toNumber(draft.duration),
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
