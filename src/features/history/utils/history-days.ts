import type { QuitMomentFact } from '@/shared/domain/facts/quit-moment'
import type { Fact } from '@/shared/domain/facts/registry'
import type { Journal } from '@/shared/domain/journal'
import { localMidnight } from '@/shared/domain/local-day'

/** Every fact the history lists: all but the quit moment, which anchors it. */
export type HistoryFact = Exclude<Fact, QuitMomentFact>

/** One fact of the history, with its place in the journal: what an edit or a delete targets. */
export type HistoryEntry = { readonly index: number; readonly fact: HistoryFact }

/** The entries of one local calendar day, `day` being its midnight. */
export type HistoryDay = { readonly day: number; readonly entries: readonly HistoryEntry[] }

const isHistoryFact = (fact: Fact): fact is HistoryFact => fact.type !== 'quit-moment'

/**
 * The journal's facts newest first, grouped by local day. On a tie the one recorded last
 * comes first. Any fact type but the quit moment is listed, known or added later.
 */
export function historyDays(journal: Journal): readonly HistoryDay[] {
  const entries = journal.facts
    .flatMap((fact, index) => (isHistoryFact(fact) ? [{ index, fact }] : []))
    .sort((a, b) => b.fact.at - a.fact.at || b.index - a.index)
  const days: { day: number; entries: HistoryEntry[] }[] = []
  for (const entry of entries) {
    const day = localMidnight(entry.fact.at)
    const last = days.at(-1)
    if (last?.day === day) last.entries.push(entry)
    else days.push({ day, entries: [entry] })
  }
  return days
}
