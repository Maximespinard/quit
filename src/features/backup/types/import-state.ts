import type { Journal } from '@/shared/domain/journal'
import type { ImportRefusal } from '@/shared/domain/journal-file'

/** Where an import stands: a refused file says why, a journal holding facts asks first. */
export type ImportState =
  | { readonly step: 'idle' }
  | { readonly step: 'refused'; readonly reason: ImportRefusal }
  | { readonly step: 'confirming'; readonly journal: Journal; readonly exportedAt: number }
  /** Once confirmed: a second tap must not replace the journal twice. */
  | { readonly step: 'replacing' }
