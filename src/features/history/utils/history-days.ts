import type { QuitMomentFact } from '@/shared/domain/facts/quit-moment'
import type { Fact } from '@/shared/domain/facts/registry'
import type { Journal } from '@/shared/domain/journal'
import { localMidnight } from '@/shared/domain/local-day'

/** Every fact the history lists: all but the quit moment, which anchors it. */
export type HistoryFact = Exclude<Fact, QuitMomentFact>

/** One fact of the history, with its place in the journal: what an edit or a delete targets. */
export type HistoryItem = { readonly index: number; readonly fact: HistoryFact }

/** The items of one local calendar day, `day` being its midnight. */
export type HistoryDay = { readonly day: number; readonly items: readonly HistoryItem[] }

const isHistoryFact = (fact: Fact): fact is HistoryFact => fact.type !== 'quit-moment'

/**
 * The journal's facts newest first, grouped by local day. On a tie the one recorded last
 * comes first. Any fact type but the quit moment is listed, known or added later.
 */
export function historyDays(journal: Journal): readonly HistoryDay[] {
  const items = journal.facts
    .flatMap((fact, index) => (isHistoryFact(fact) ? [{ index, fact }] : []))
    .sort((a, b) => b.fact.at - a.fact.at || b.index - a.index)
  const days: { day: number; items: HistoryItem[] }[] = []
  for (const item of items) {
    const day = localMidnight(item.fact.at)
    const last = days.at(-1)
    if (last?.day === day) last.items.push(item)
    else days.push({ day, items: [item] })
  }
  return days
}

/** The fact a history item points to, or `null` when that index holds none the history lists. */
export function historyFactAt(journal: Journal, index: number): HistoryFact | null {
  const fact = Number.isInteger(index) ? journal.facts[index] : undefined
  return fact !== undefined && isHistoryFact(fact) ? fact : null
}
