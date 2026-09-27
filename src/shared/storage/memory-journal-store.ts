import { emptyJournal, type Journal } from '@/shared/domain/journal'
import type { JournalStore } from './journal-store'

/**
 * A journal held in memory only: it starts from `initial` (empty by default) and is gone on
 * reload. Never touches the device.
 */
export function createMemoryJournalStore(initial: Journal = emptyJournal): JournalStore {
  let current = initial
  return {
    load: async () => current,
    save: async (journal) => {
      current = journal
    },
  }
}
