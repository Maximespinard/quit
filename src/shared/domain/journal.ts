import { factSchema } from '@quit/contract/facts'
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
 * The journal without the fact at `index`; unchanged when no fact sits there. Editing a fact
 * is removing it, then recording the new version through its own module: the same rules
 * as at creation, by construction.
 */
export function removeFact(journal: Journal, index: number): Journal {
  if (!Number.isInteger(index) || index < 0 || index >= journal.facts.length) return journal
  return { ...journal, facts: journal.facts.toSpliced(index, 1) }
}
