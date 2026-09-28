import { LAPSE } from './facts/lapse'
import { PATCH_APPLICATION } from './facts/patch-application'
import { latestQuitMoment } from './facts/quit-moment'
import { decodeFact, type Fact, factModules } from './facts/registry'
import type { Journal } from './journal'
import { isValidBaseline, isValidWeeklySpend } from './journal-settings'
import { decodeStrictProtocol } from './protocol'

/**
 * The export file, the user's only backup (ADR-0001). A new fact type is read through its
 * registry module, and brings its own checks here if it has more than its shape; a change
 * to the shape of the file itself bumps the version.
 */
const FORMAT = 'quit-journal'
const VERSION = 1

/** Which journal a file was exported from, or is imported into. */
export type JournalOrigin = 'device' | 'sandbox'

const isOrigin = (value: unknown): value is JournalOrigin =>
  value === 'device' || value === 'sandbox'

/**
 * The journal as one JSON file: facts and settings only, never a derived value (ADR-0002).
 * `now` stamps the file; money stays in integer cents.
 */
export function exportJournal(journal: Journal, now: number, origin: JournalOrigin): string {
  const { facts, protocol, weeklySpendCents, baselineSmokesPerDay } = journal
  return JSON.stringify({
    format: FORMAT,
    version: VERSION,
    exportedAt: now,
    origin,
    journal: { facts, protocol, weeklySpendCents, baselineSmokesPerDay },
  })
}

export type ImportRefusal =
  /** Not JSON: corrupted, truncated, or another kind of file. */
  | 'unreadable'
  /** JSON, but not a journal export. */
  | 'not-an-export'
  | 'unsupported-version'
  /** A sandbox export, over the real journal: a test must never replace the user's data. */
  | 'sandbox-file'
  | 'unknown-fact-type'
  | 'invalid-fact'
  | 'invalid-settings'
  | 'no-quit-moment'
  | 'before-quit-moment'

export type ImportJournalResult =
  | { readonly ok: true; readonly journal: Journal; readonly exportedAt: number }
  | { readonly ok: false; readonly reason: ImportRefusal }

const notAnExport = { ok: false, reason: 'not-an-export' } as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** A fact of a type added by a later version (check-in, say), as opposed to a malformed one. */
const isUnknownFactType = (raw: unknown) =>
  isRecord(raw) &&
  typeof raw.type === 'string' &&
  !factModules.some((factModule) => factModule.type === raw.type)

/** Unset, or valid: a setting is never silently reset by an import. */
const settingOrNull = (value: unknown, isValid: (value: number) => boolean) =>
  value === null ? null : typeof value === 'number' && isValid(value) ? value : undefined

/** Facts recording refuses before the quit moment in force; a craving may predate it. */
const needsQuitMoment = (fact: Fact) => fact.type === LAPSE || fact.type === PATCH_APPLICATION

function readJournal(raw: Record<string, unknown>): Journal | ImportRefusal {
  const protocol = decodeStrictProtocol(raw.protocol)
  const weeklySpendCents = settingOrNull(raw.weeklySpendCents, isValidWeeklySpend)
  const baselineSmokesPerDay = settingOrNull(raw.baselineSmokesPerDay, isValidBaseline)
  if (protocol === null || weeklySpendCents === undefined || baselineSmokesPerDay === undefined)
    return 'invalid-settings'

  if (!Array.isArray(raw.facts)) return 'invalid-fact'
  const facts: Fact[] = []
  for (const rawFact of raw.facts) {
    const fact = decodeFact(rawFact)
    if (fact === null) return isUnknownFactType(rawFact) ? 'unknown-fact-type' : 'invalid-fact'
    facts.push(fact)
  }

  const journal: Journal = { facts, protocol, weeklySpendCents, baselineSmokesPerDay }
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null) return 'no-quit-moment'
  if (facts.some((fact) => needsQuitMoment(fact) && fact.at < quitMoment))
    return 'before-quit-moment'
  return journal
}

/**
 * Reads an export back, all or nothing: the first problem refuses the whole file, where
 * loading from storage would drop it. Nothing is written here; the caller replaces the
 * `into` journal only on `ok`.
 */
export function importJournal(text: string, into: JournalOrigin): ImportJournalResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'unreadable' }
  }
  if (!isRecord(raw) || raw.format !== FORMAT) return notAnExport
  if (raw.version !== VERSION) return { ok: false, reason: 'unsupported-version' }
  const { exportedAt, origin, journal: rawJournal } = raw
  if (typeof exportedAt !== 'number' || !Number.isFinite(exportedAt)) return notAnExport
  if (!isOrigin(origin) || !isRecord(rawJournal)) return notAnExport
  if (origin === 'sandbox' && into === 'device') return { ok: false, reason: 'sandbox-file' }

  const journal = readJournal(rawJournal)
  return typeof journal === 'string'
    ? { ok: false, reason: journal }
    : { ok: true, journal, exportedAt }
}
