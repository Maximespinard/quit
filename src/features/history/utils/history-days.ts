import type { Fact, FactId, QuitMomentFact } from '@quit/contract/facts'
import type { Journal } from '@/shared/domain/journal'
import { localMidnight } from '@/shared/domain/local-day'

/** Every fact the history lists: all but the quit moment, which anchors it. */
export type HistoryFact = Exclude<Fact, QuitMomentFact>

/** One fact of the history, with its id: what an edit or a delete targets. */
export type HistoryItem = { readonly id: FactId; readonly fact: HistoryFact }

/** The items of one local calendar day, `day` being its midnight. */
export type HistoryDay = { readonly day: number; readonly items: readonly HistoryItem[] }

const isHistoryFact = (fact: Fact): fact is HistoryFact => fact.type !== 'quit-moment'

/**
 * The journal's facts newest first, grouped by local day. On a tie the one recorded last
 * comes first. Any fact type but the quit moment is listed, known or added later, opened
 * by its id.
 */
export function historyDays(journal: Journal): readonly HistoryDay[] {
  const items = journal.facts
    .flatMap((fact, index) => (isHistoryFact(fact) ? [{ index, id: fact.id, fact }] : []))
    .sort((a, b) => b.fact.at - a.fact.at || b.index - a.index)
  const days: { day: number; items: HistoryItem[] }[] = []
  for (const { id, fact } of items) {
    const day = localMidnight(fact.at)
    const last = days.at(-1)
    if (last?.day === day) last.items.push({ id, fact })
    else days.push({ day, items: [{ id, fact }] })
  }
  return days
}

/** The fact a history item points to, or `null` when no fact the history lists has that id. */
export function historyFact(journal: Journal, id: FactId): HistoryFact | null {
  const fact = journal.facts.find((candidate) => candidate.id === id)
  return fact !== undefined && isHistoryFact(fact) ? fact : null
}
