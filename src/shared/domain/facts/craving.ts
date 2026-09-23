import type { Journal } from '../journal'
export const CRAVING = 'craving' as const

export const CRAVING_INTENSITIES = [1, 2, 3] as const
export type CravingIntensity = (typeof CRAVING_INTENSITIES)[number]

const isIntensity = (value: unknown): value is CravingIntensity =>
  CRAVING_INTENSITIES.some((intensity) => intensity === value)

/** A craving the user chose to log, rated 1 to 3. Not a lapse. */
export type CravingFact = {
  readonly type: typeof CRAVING
  /** When the craving began: the timer's start, or a backdated moment. */
  readonly at: number
  readonly intensity: CravingIntensity
  /** True only when the craving timer ran to its end. */
  readonly heldToEnd: boolean
}

export const cravingModule = {
  type: CRAVING,
  /** Turns a stored value back into a fact, or `null` when it is not one. */
  decode(raw: unknown): CravingFact | null {
    if (typeof raw !== 'object' || raw === null) return null
    const { type, at, intensity, heldToEnd } = raw as Record<string, unknown>
    if (type !== CRAVING || typeof at !== 'number' || !Number.isFinite(at)) return null
    if (!isIntensity(intensity) || typeof heldToEnd !== 'boolean') return null
    return { type: CRAVING, at, intensity, heldToEnd }
  },
}

export type CravingInput = Omit<CravingFact, 'type'>

export type RecordCravingResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'future' }

/** Records a craving. One set after `now` is refused: nothing happened yet. */
export function recordCraving(
  journal: Journal,
  craving: CravingInput,
  now: number,
): RecordCravingResult {
  if (craving.at > now) return { ok: false, reason: 'future' }
  return {
    ok: true,
    journal: { ...journal, facts: [...journal.facts, { type: CRAVING, ...craving }] },
  }
}
