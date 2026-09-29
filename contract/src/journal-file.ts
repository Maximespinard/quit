import * as z from 'zod/mini'
import { instantSchema } from './facts.ts'
import { journalSchema } from './journal.ts'

/**
 * The export file (ADR-0001): the journal as one JSON file. A new fact type is read through
 * `factSchema`; a change to the shape of the file itself bumps the version.
 */
export const JOURNAL_FILE_FORMAT = 'quit-journal'
/**
 * 2 gives every fact its id. A version 1 file is still read: the app gives its facts their ids
 * before this schema checks them.
 */
export const JOURNAL_FILE_VERSION = 2
const READABLE_VERSIONS = [1, JOURNAL_FILE_VERSION] as const

/** Which journal a file was exported from, or is imported into. */
export const journalOriginSchema = z.enum(['device', 'sandbox'])
export type JournalOrigin = z.infer<typeof journalOriginSchema>

export const journalFileSchema = z.object({
  format: z.literal(JOURNAL_FILE_FORMAT),
  version: z.literal(READABLE_VERSIONS),
  /** When the file was written. */
  exportedAt: instantSchema,
  origin: journalOriginSchema,
  journal: journalSchema,
})
export type JournalFile = z.infer<typeof journalFileSchema>
