import {
  type Fact,
  type FactId,
  factTypeSchema,
  LAPSE,
  PATCH_APPLICATION,
} from '@quit/contract/facts'
import {
  JOURNAL_FILE_FORMAT,
  JOURNAL_FILE_VERSION,
  type JournalFile,
  type JournalOrigin,
  journalFileSchema,
} from '@quit/contract/journal-file'
import { latestQuitMoment } from './facts/quit-moment'
import { identifyFacts, type Journal } from './journal'

/**
 * The export file, the user's only backup (ADR-0001). Its shape is the contract's
 * `journalFileSchema`; this module adds the refusal reasons and the domain rules an import
 * checks on top of the shape.
 */

/**
 * The journal as one JSON file: facts and settings only, never a derived value (ADR-0002).
 * `now` stamps the file; money stays in integer cents.
 */
export function exportJournal(journal: Journal, now: number, origin: JournalOrigin): string {
  const { facts, protocol, weeklySpendCents, baselineSmokesPerDay, goal } = journal
  const file: JournalFile = {
    format: JOURNAL_FILE_FORMAT,
    version: JOURNAL_FILE_VERSION,
    exportedAt: now,
    origin,
    journal: { facts, protocol, weeklySpendCents, baselineSmokesPerDay, goal },
  }
  return JSON.stringify(file)
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

/** Where the schema found a problem, in the file's own keys. */
type IssuePath = readonly PropertyKey[]

/** The value at `key`, or `undefined` when `value` holds none. */
const child = (value: unknown, key: PropertyKey): unknown =>
  typeof value === 'object' && value !== null && key in value ? Reflect.get(value, key) : undefined

/**
 * The problem with the file itself, before its content: another format first, then another
 * version, then a missing export time, origin or journal.
 */
function envelopeRefusal(paths: readonly IssuePath[]): ImportRefusal | null {
  if (paths.some((path) => path.length === 0 || path[0] === 'format')) return 'not-an-export'
  if (paths.some((path) => path[0] === 'version')) return 'unsupported-version'
  if (paths.some((path) => path[0] !== 'journal' || path.length === 1)) return 'not-an-export'
  return null
}

/**
 * The problem with the journal a well-formed file holds: its settings first, then its first
 * malformed fact — of a type added by a later version (check-in, say), or broken.
 */
function contentRefusal(paths: readonly IssuePath[], raw: unknown): ImportRefusal {
  if (paths.some((path) => path[1] !== 'facts')) return 'invalid-settings'
  const factIndexes = paths.flatMap((path) => (typeof path[2] === 'number' ? [path[2]] : []))
  // Facts that are not a list: no index to look at.
  if (factIndexes.length < paths.length) return 'invalid-fact'
  const firstBroken = ['journal', 'facts', Math.min(...factIndexes), 'type'].reduce(child, raw)
  return typeof firstBroken === 'string' && !factTypeSchema.safeParse(firstBroken).success
    ? 'unknown-fact-type'
    : 'invalid-fact'
}

/** Facts recording refuses before the quit moment in force; a craving may predate it. */
const needsQuitMoment = (fact: Fact) => fact.type === LAPSE || fact.type === PATCH_APPLICATION

function domainRefusal(journal: Journal): ImportRefusal | null {
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null) return 'no-quit-moment'
  if (journal.facts.some((fact) => needsQuitMoment(fact) && fact.at < quitMoment))
    return 'before-quit-moment'
  return null
}

/** The file as read, its journal's facts identified before the schema checks them. */
const withIdentifiedFacts = (raw: unknown, newId: () => FactId): unknown =>
  typeof raw === 'object' && raw !== null && 'journal' in raw
    ? { ...raw, journal: identifyFacts(raw.journal, newId) }
    : raw

/**
 * Reads an export back, all or nothing: the first problem refuses the whole file, where
 * loading from storage would drop it. A fact without an id (every fact of a version 1 file)
 * gets one from `newId`. Nothing is written here; the caller replaces the `into` journal only
 * on `ok`.
 */
export function importJournal(
  text: string,
  into: JournalOrigin,
  newId: () => FactId,
): ImportJournalResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'unreadable' }
  }
  const file = journalFileSchema.safeParse(withIdentifiedFacts(raw, newId))
  const paths = file.success ? [] : file.error.issues.map((issue) => issue.path)
  const envelope = envelopeRefusal(paths)
  if (envelope !== null) return { ok: false, reason: envelope }
  // Past the envelope the origin is known good, whatever the journal holds.
  if (child(raw, 'origin') === 'sandbox' && into === 'device')
    return { ok: false, reason: 'sandbox-file' }
  if (!file.success) return { ok: false, reason: contentRefusal(paths, raw) }

  const { journal, exportedAt } = file.data
  const refusal = domainRefusal(journal)
  return refusal === null ? { ok: true, journal, exportedAt } : { ok: false, reason: refusal }
}
