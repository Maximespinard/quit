import { decodeFact, type Fact } from './facts/registry'
import { isValidBaseline, isValidWeeklySpend } from './journal-settings'
import { decodeProtocol, defaultProtocol, type Protocol } from './protocol'

/** The facts recorded by one person plus the settings that shape what is derived — the only thing ever stored. */
export type Journal = {
  readonly facts: readonly Fact[]
  readonly protocol: Protocol
  /** Weekly tobacco spend in integer cents; `null` until first launch sets it. */
  readonly weeklySpendCents: number | null
  /** Smokes per day before the quit moment; `null` until first launch sets it. */
  readonly baselineSmokesPerDay: number | null
}

/** A new journal: no fact yet, the default protocol, no setting. */
export const emptyJournal: Journal = {
  facts: [],
  protocol: defaultProtocol,
  weeklySpendCents: null,
  baselineSmokesPerDay: null,
}

const validOrNull = (value: unknown, isValid: (value: number) => boolean) =>
  typeof value === 'number' && isValid(value) ? value : null

/** Rebuilds a journal from a stored value, dropping anything no fact module recognises. */
export function decodeJournal(raw: unknown): Journal {
  if (typeof raw !== 'object' || raw === null) return emptyJournal
  const { facts, protocol, weeklySpendCents, baselineSmokesPerDay } = raw as Record<string, unknown>
  return {
    facts: Array.isArray(facts) ? facts.map(decodeFact).filter((fact) => fact !== null) : [],
    protocol: decodeProtocol(protocol),
    weeklySpendCents: validOrNull(weeklySpendCents, isValidWeeklySpend),
    baselineSmokesPerDay: validOrNull(baselineSmokesPerDay, isValidBaseline),
  }
}
