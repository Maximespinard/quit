import { emptyJournal, type Journal } from '@/shared/domain/journal'
import type { JournalStore } from './journal-store'

/** A journal held in memory only: it starts empty and is gone on reload. Never touches the device. */
export function createMemoryJournalStore(): JournalStore {
  let current: Journal = emptyJournal
  return {
    load: async () => current,
    save: async (journal) => {
      current = journal
    },
  }
}
