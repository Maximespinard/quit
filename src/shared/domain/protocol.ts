import { doseMgSchema } from '@quit/contract/facts'
import { durationDaysSchema, type Protocol, type Step } from '@quit/contract/settings'
import type { Journal, JournalOutcome } from './journal'

/**
 * Every new journal starts on this taper. Each step lasts 4 weeks, the upper bound of the
 * 3 to 4 weeks the French patch notices give per step: docs/research/patch-step-durations.md.
 */
export const defaultProtocol: Protocol = [
  { doseMg: 21, durationDays: 28 },
  { doseMg: 14, durationDays: 28 },
  { doseMg: 7, durationDays: 28 },
]

/** Any positive dose: a cut patch gives a half dose. */
export const isValidDose = (doseMg: number) => doseMgSchema.safeParse(doseMg).success

/** Whole days only: every patch is a 24 h patch. */
export const isValidDuration = (durationDays: number) =>
  durationDaysSchema.safeParse(durationDays).success

const isValidStep = ({ doseMg, durationDays }: Step) =>
  isValidDose(doseMg) && isValidDuration(durationDays)

/** A blank brand is no brand: the key is dropped rather than stored empty. */
function normaliseStep({ doseMg, durationDays, brand }: Step): Step {
  const trimmed = brand?.trim() ?? ''
  return trimmed === '' ? { doseMg, durationDays } : { doseMg, durationDays, brand: trimmed }
}

/** Replaces the whole protocol, at any time. Zero steps, or a step without a dose or a duration, is refused. */
export function setProtocol(
  journal: Journal,
  steps: readonly Step[],
): JournalOutcome<'empty' | 'invalid'> {
  if (steps.length === 0) return { ok: false, reason: 'empty' }
  if (!steps.every(isValidStep)) return { ok: false, reason: 'invalid' }
  return { ok: true, journal: { ...journal, protocol: steps.map(normaliseStep) } }
}

/** Whether saving `steps` would store `inForce` again: same steps, in the same order, as stored. */
export function isSameProtocol(inForce: Protocol, steps: readonly Step[]): boolean {
  if (steps.length !== inForce.length) return false
  return steps.map(normaliseStep).every((step, index) => {
    const current = inForce[index]
    return (
      current !== undefined &&
      step.doseMg === current.doseMg &&
      step.durationDays === current.durationDays &&
      step.brand === current.brand
    )
  })
}
