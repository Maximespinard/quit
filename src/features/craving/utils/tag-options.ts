import { uniqueTags } from '@/shared/domain/facts/craving'
import type { Journal } from '@/shared/domain/journal'
import { strings } from '@/shared/utils/strings'
import {
  type CravingTagOption,
  customTags,
  DEFAULT_CRAVING_TAGS,
  isDefaultCravingTag,
} from '../domain/craving-tags'

/**
 * Every tag the form offers: the defaults in their fixed order, then the user's own. `kept`:
 * the tags of a craving being edited, offered too although the journal no longer holds it.
 */
export function tagOptions(
  journal: Journal,
  kept: readonly string[] = [],
): readonly CravingTagOption[] {
  const custom = uniqueTags([...customTags(journal), ...kept]).filter(
    (tag) => !isDefaultCravingTag(tag),
  )
  return [
    ...DEFAULT_CRAVING_TAGS.map((tag) => ({ tag, label: strings.craving.tags.defaults[tag] })),
    ...custom.map((tag) => ({ tag, label: tag })),
  ]
}
