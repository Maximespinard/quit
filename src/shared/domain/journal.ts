import { decodeFact, type Fact } from './facts/registry'
import { decodeProtocol, defaultProtocol, type Protocol } from './protocol'

/** The facts recorded by one person plus the settings that shape what is derived — the only thing ever stored. */
export type Journal = {
  readonly facts: readonly Fact[]
  readonly protocol: Protocol
}

/** A new journal: no fact yet, the default protocol. */
export const emptyJournal: Journal = { facts: [], protocol: defaultProtocol }

/** Rebuilds a journal from a stored value, dropping anything no fact module recognises. */
export function decodeJournal(raw: unknown): Journal {
  if (typeof raw !== 'object' || raw === null) return emptyJournal
  const { facts, protocol } = raw as { facts?: unknown; protocol?: unknown }
  return {
    facts: Array.isArray(facts) ? facts.map(decodeFact).filter((fact) => fact !== null) : [],
    protocol: decodeProtocol(protocol),
  }
}
