import type { Journal } from './journal'

/** One step of the protocol: a 24 h patch dose and how many days it lasts. */
export type Step = {
  readonly doseMg: number
  readonly durationDays: number
  /** Free-text brand, noted by the user. */
  readonly brand?: string
}

/** The user-defined taper, in order. Never empty; a lapse never alters it. */
export type Protocol = readonly Step[]

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
export const isValidDose = (doseMg: number) => Number.isFinite(doseMg) && doseMg > 0

/** Whole days only: every patch is a 24 h patch. */
export const isValidDuration = (durationDays: number) =>
  Number.isInteger(durationDays) && durationDays > 0

const isValidStep = ({ doseMg, durationDays }: Step) =>
  isValidDose(doseMg) && isValidDuration(durationDays)

/** A blank brand is no brand: the key is dropped rather than stored empty. */
function normaliseStep({ doseMg, durationDays, brand }: Step): Step {
  const trimmed = brand?.trim() ?? ''
  return trimmed === '' ? { doseMg, durationDays } : { doseMg, durationDays, brand: trimmed }
}

export type SetProtocolResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'empty' | 'invalid' }

/** Replaces the whole protocol, at any time. Zero steps, or a step without a dose or a duration, is refused. */
export function setProtocol(journal: Journal, steps: readonly Step[]): SetProtocolResult {
  if (steps.length === 0) return { ok: false, reason: 'empty' }
  if (!steps.every(isValidStep)) return { ok: false, reason: 'invalid' }
  return { ok: true, journal: { ...journal, protocol: steps.map(normaliseStep) } }
}

function decodeStep(raw: unknown): Step | null {
  if (typeof raw !== 'object' || raw === null) return null
  const { doseMg, durationDays, brand } = raw as Record<string, unknown>
  if (typeof doseMg !== 'number' || typeof durationDays !== 'number') return null
  const step = normaliseStep({
    doseMg,
    durationDays,
    ...(typeof brand === 'string' ? { brand } : {}),
  })
  return isValidStep(step) ? step : null
}

/** Rebuilds a protocol only if every step is valid, else `null`: an import refuses what storage forgives. */
export function decodeStrictProtocol(raw: unknown): Protocol | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const steps = raw.map(decodeStep)
  return steps.every((step) => step !== null) ? steps : null
}

/** Rebuilds a stored protocol; anything missing or malformed yields the default protocol. */
export const decodeProtocol = (raw: unknown): Protocol =>
  decodeStrictProtocol(raw) ?? defaultProtocol
