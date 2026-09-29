import { type Fact, type FactId, factSchema } from '@quit/contract/facts'
import type { Journal } from '@quit/contract/journal'
import {
  baselineSmokesPerDaySchema,
  goalSchema,
  protocolSchema,
  weeklySpendCentsSchema,
} from '@quit/contract/settings'
import * as z from 'zod/mini'
import { defaultProtocol } from './protocol'

/**
 * The facts recorded by one person plus the settings that shape what is derived — the only
 * thing ever stored. Defined by the contract; exposed here, where the whole app reads it.
 */
export type { Journal }

/** A new journal: no fact yet, the default protocol, no setting, no goal. */
export const emptyJournal: Journal = {
  facts: [],
  protocol: defaultProtocol,
  weeklySpendCents: null,
  baselineSmokesPerDay: null,
  goal: null,
}

/**
 * The journal as the device stored it, read leniently: storage forgives what an import
 * refuses. A missing or malformed setting reads as unset (the default protocol for the
 * protocol); facts are checked one by one below.
 */
const storedJournalSchema = z.object({
  facts: z.catch(z.array(z.unknown()), []),
  protocol: z.catch(protocolSchema, defaultProtocol),
  weeklySpendCents: z.catch(z.nullable(weeklySpendCentsSchema), null),
  baselineSmokesPerDay: z.catch(z.nullable(baselineSmokesPerDaySchema), null),
  goal: z.catch(z.nullable(goalSchema), null),
})

/** Rebuilds a journal from a stored value, dropping any fact the contract does not recognise. */
export function decodeJournal(raw: unknown): Journal {
  const stored = storedJournalSchema.safeParse(raw)
  if (!stored.success) return emptyJournal
  const { facts, ...settings } = stored.data
  return {
    ...settings,
    facts: facts.flatMap((rawFact) => {
      const fact = factSchema.safeParse(rawFact)
      return fact.success ? [fact.data] : []
    }),
  }
}

/**
 * The journal with every fact identified (ADR-0003): a fact without an id, or sharing the id
 * of one before it, gets the next one `newId` makes; the others keep theirs. Unchanged when
 * every fact already has its own.
 */
export function withFactIds(journal: Journal, newId: () => FactId): Journal {
  const seen = new Set<FactId>()
  let changed = false
  const facts = journal.facts.map((fact): Fact => {
    if (fact.id !== undefined && !seen.has(fact.id)) {
      seen.add(fact.id)
      return fact
    }
    changed = true
    const id = newId()
    seen.add(id)
    return { ...fact, id }
  })
  return changed ? { ...journal, facts } : journal
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * A stored journal, as stored, its facts given an id each: what the storage upgrade to fact
 * ids writes back. Nothing is decoded, so nothing is dropped — a fact the app no longer
 * reads keeps every key it had.
 */
export function giveStoredFactsIds(stored: unknown, newId: () => FactId): unknown {
  if (!isRecord(stored) || !Array.isArray(stored.facts)) return stored
  const facts: unknown[] = stored.facts.map((fact: unknown) =>
    isRecord(fact) && !('id' in fact) ? { ...fact, id: newId() } : fact,
  )
  return { ...stored, facts }
}

/**
 * The id a new version of `fact` is recorded under, to spread into its input: a corrected
 * fact stays the same fact. Nothing for a new fact, which gets its id once stored.
 */
export const keptId = (
  fact: { readonly id?: FactId | undefined } | undefined,
): { readonly id?: FactId } => (fact?.id === undefined ? {} : { id: fact.id })

/**
 * The journal without the fact identified by `id`; unchanged when no fact has it. Editing a
 * fact is removing it, then recording the new version, with the same id, through its own
 * module: the same rules as at creation, by construction.
 */
export function removeFact(journal: Journal, id: FactId): Journal {
  const facts = journal.facts.filter((fact) => fact.id !== id)
  return facts.length === journal.facts.length ? journal : { ...journal, facts }
}
