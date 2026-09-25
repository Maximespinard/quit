import type { Journal } from '@/shared/domain/journal'
import { strings } from '@/shared/utils/strings'
import { type CravingTagOption, customTags, DEFAULT_CRAVING_TAGS } from '../domain/craving-tags'

/** Every tag the form offers: the defaults in their fixed order, then the user's own. */
export function tagOptions(journal: Journal): readonly CravingTagOption[] {
  return [
    ...DEFAULT_CRAVING_TAGS.map((tag) => ({ tag, label: strings.craving.tags.defaults[tag] })),
    ...customTags(journal).map((tag) => ({ tag, label: tag })),
  ]
}
