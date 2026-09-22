import { decodeFact, type Fact } from './facts/registry'

/** The whole set of facts recorded by one person — the only thing ever stored. */
export type Journal = {
  readonly facts: readonly Fact[]
}

export const emptyJournal: Journal = { facts: [] }

/** Rebuilds a journal from a stored value, dropping anything no fact module recognises. */
export function decodeJournal(raw: unknown): Journal {
  if (typeof raw !== 'object' || raw === null) return emptyJournal
  const { facts } = raw as { facts?: unknown }
  if (!Array.isArray(facts)) return emptyJournal
  return { facts: facts.map(decodeFact).filter((fact) => fact !== null) }
}
