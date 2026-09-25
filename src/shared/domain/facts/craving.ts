import type { Journal } from '../journal'
export const CRAVING = 'craving' as const

export const CRAVING_INTENSITIES = [1, 2, 3] as const
export type CravingIntensity = (typeof CRAVING_INTENSITIES)[number]

const isIntensity = (value: unknown): value is CravingIntensity =>
  CRAVING_INTENSITIES.some((intensity) => intensity === value)

/** Trims a typed tag and collapses its inner spacing: `'  Jeu   vidéo '` → `'Jeu vidéo'`. */
export const normalizeTag = (tag: string): string => tag.trim().replace(/\s+/g, ' ')

/** Two tags differing only by case or spacing share one key: they are the same tag. */
export const tagKey = (tag: string): string => normalizeTag(tag).toLocaleLowerCase('fr')

/** Normalised, blanks dropped, duplicates merged by `tagKey` — the first spelling wins. */
export function uniqueTags(tags: readonly string[]): readonly string[] {
  const byKey = new Map<string, string>()
  for (const tag of tags.map(normalizeTag)) {
    const key = tagKey(tag)
    if (tag !== '' && !byKey.has(key)) byKey.set(key, tag)
  }
  return [...byKey.values()]
}

const isTagList = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((tag) => typeof tag === 'string')

/** A craving the user chose to log, rated 1 to 3. Not a lapse. */
export type CravingFact = {
  readonly type: typeof CRAVING
  /** When the craving began: the timer's start, or a backdated moment. */
  readonly at: number
  readonly intensity: CravingIntensity
  /** True only when the craving timer ran to its end. */
  readonly heldToEnd: boolean
  /** The situation it arose in: default tag ids or the user's own words. Often empty. */
  readonly tags: readonly string[]
}

export const cravingModule = {
  type: CRAVING,
  /** Turns a stored value back into a fact, or `null` when it is not one. */
  decode(raw: unknown): CravingFact | null {
    if (typeof raw !== 'object' || raw === null) return null
    const { type, at, intensity, heldToEnd, tags = [] } = raw as Record<string, unknown>
    if (type !== CRAVING || typeof at !== 'number' || !Number.isFinite(at)) return null
    if (!isIntensity(intensity) || typeof heldToEnd !== 'boolean') return null
    // A craving stored before tags existed carries none.
    if (!isTagList(tags)) return null
    return { type: CRAVING, at, intensity, heldToEnd, tags }
  },
}

export type CravingInput = Omit<CravingFact, 'type'>

export type RecordCravingResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'future' }

/**
 * Records a craving, its tags cleaned by `uniqueTags`.
 * One set after `now` is refused: nothing happened yet.
 */
export function recordCraving(
  journal: Journal,
  craving: CravingInput,
  now: number,
): RecordCravingResult {
  if (craving.at > now) return { ok: false, reason: 'future' }
  return {
    ok: true,
    journal: {
      ...journal,
      facts: [...journal.facts, { type: CRAVING, ...craving, tags: uniqueTags(craving.tags) }],
    },
  }
}
