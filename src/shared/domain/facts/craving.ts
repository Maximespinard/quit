import { CRAVING, type CravingFact } from '@quit/contract/facts'
import type { Journal } from '../journal'

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
