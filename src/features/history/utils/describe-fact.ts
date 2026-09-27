import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import type { HistoryFact } from './history-days'

/** What a history row says about a fact: what it was, then its key details. */
export type FactDescription = { readonly title: string; readonly detail: string }

const copy = strings.history.facts
const defaultTags: Readonly<Record<string, string>> = strings.craving.tags.defaults

/**
 * One case per fact type: the list itself never changes, and a type added to the journal
 * fails to compile here until it is described.
 */
export function describeFact(fact: HistoryFact): FactDescription {
  switch (fact.type) {
    case 'patch-application':
      return { title: copy.patch, detail: copy.dose(formatDose(fact.doseMg)) }
    case 'craving': {
      const tags = fact.tags.map((tag) => defaultTags[tag] ?? tag).join(', ')
      const intensity = copy.intensity(fact.intensity)
      return {
        title: fact.heldToEnd ? copy.cravingHeld : copy.craving,
        detail: tags === '' ? intensity : `${intensity} · ${tags}`,
      }
    }
    case 'lapse':
      return { title: copy.lapse, detail: copy.cigarettes(fact.count) }
  }
}
