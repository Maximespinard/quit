import { CRAVING } from '@quit/contract/facts'
import { normalizeTag, tagKey, uniqueTags } from '@/shared/domain/facts/craving'
import type { Journal } from '@/shared/domain/journal'

/** The tags always offered, stored by id. Their French labels live in the strings module. */
export const DEFAULT_CRAVING_TAGS = [
  'coffee',
  'meal',
  'stress',
  'boredom',
  'break',
  'evening-out',
  'youtube',
  'after-exercise',
] as const

/** One tag as the form offers it: what is stored, and what is shown. */
export type CravingTagOption = { readonly tag: string; readonly label: string }

const defaultKeys = new Set<string>(DEFAULT_CRAVING_TAGS)

/**
 * The tags the user typed on past cravings, offered again: derived from the journal, never
 * stored apart. Most recently used first, each once, spelled as last used.
 */
export function customTags(journal: Journal): readonly string[] {
  const newestFirst = journal.facts
    .filter((fact) => fact.type === CRAVING)
    .toSorted((a, b) => b.at - a.at)
  return uniqueTags(newestFirst.flatMap((craving) => craving.tags)).filter(
    (tag) => !defaultKeys.has(tagKey(tag)),
  )
}

/**
 * What a typed tag stands for: the offered tag it matches by label or by stored value, case and
 * spacing aside, else the typed words cleaned. `null` for a blank entry.
 */
export function resolveTypedTag(
  typed: string,
  offered: readonly CravingTagOption[],
): string | null {
  const tag = normalizeTag(typed)
  if (tag === '') return null
  const key = tagKey(tag)
  const match = offered.find((option) => tagKey(option.label) === key || tagKey(option.tag) === key)
  return match?.tag ?? tag
}
