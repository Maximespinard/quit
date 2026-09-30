import { type FactId, factSchema } from '@quit/contract/facts'
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

/**
 * What a change to the journal comes to: the changed journal, or why it was refused, the
 * journal left as it was. A refusal is a reason (`'future'`), or an object when saying it
 * needs more than one word; `Accepted` adds what an accepted change also returns.
 */
export type JournalOutcome<Refusal, Accepted extends object = object> =
  | (Accepted & { readonly ok: true; readonly journal: Journal })
  | ({ readonly ok: false } & (Refusal extends string ? { readonly reason: Refusal } : Refusal))

/** Why an outcome can be refused: the reasons it may carry. */
export type RefusalOf<Outcome> = Extract<
  Outcome,
  { readonly ok: false; readonly reason: unknown }
>['reason']

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * A journal as stored or exported, as it is, each of its facts identified (ADR-0003): a fact
 * without an id, or sharing the id of one before it, gets the next one `newId` makes. Nothing
 * is decoded, so nothing is dropped — a fact the app no longer reads keeps every key it had.
 * Every way in goes through it before the schemas: past them, every fact has its own id.
 */
export function identifyFacts(raw: unknown, newId: () => FactId): unknown {
  if (!isRecord(raw) || !Array.isArray(raw.facts)) return raw
  const seen = new Set<unknown>()
  const facts: unknown[] = raw.facts.map((fact: unknown) => {
    if (!isRecord(fact)) return fact
    if (fact.id !== undefined && !seen.has(fact.id)) {
      seen.add(fact.id)
      return fact
    }
    const id = newId()
    seen.add(id)
    return { ...fact, id }
  })
  return { ...raw, facts }
}

/**
 * Rebuilds a journal from a stored value, dropping any fact the contract does not recognise.
 * A fact stored without an id gets one from `newId`, kept once the journal is saved again.
 */
export function decodeJournal(raw: unknown, newId: () => FactId): Journal {
  const stored = storedJournalSchema.safeParse(identifyFacts(raw, newId))
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
 * The journal without the fact identified by `id`; unchanged when no fact has it. Editing a
 * fact is removing it, then recording the new version, with the same id, through its own
 * module: the same rules as at creation, by construction.
 */
export function removeFact(journal: Journal, id: FactId): Journal {
  const facts = journal.facts.filter((fact) => fact.id !== id)
  return facts.length === journal.facts.length ? journal : { ...journal, facts }
}
