import * as z from 'zod/mini'
import { journalSchema } from './journal.ts'

/**
 * The export file (ADR-0001): the journal as one JSON file. A new fact type is read through
 * `factSchema`; a change to the shape of the file itself bumps the version.
 */
export const JOURNAL_FILE_FORMAT = 'quit-journal'
export const JOURNAL_FILE_VERSION = 1

/** Which journal a file was exported from, or is imported into. */
export const journalOriginSchema = z.enum(['device', 'sandbox'])
export type JournalOrigin = z.infer<typeof journalOriginSchema>

export const journalFileSchema = z.object({
  format: z.literal(JOURNAL_FILE_FORMAT),
  version: z.literal(JOURNAL_FILE_VERSION),
  /** When the file was written, in ms since the epoch. */
  exportedAt: z.number(),
  origin: journalOriginSchema,
  journal: journalSchema,
})
export type JournalFile = z.infer<typeof journalFileSchema>
