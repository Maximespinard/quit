import { emptyJournal, type Journal } from '@/shared/domain/journal'
import type { JournalStore, Store } from './journal-store'

/** A value held in memory only: it starts from `initial` and is gone on reload. Never touches the device. */
export function createMemoryStore<T>(initial: T): Store<T> {
  let current = initial
  return {
    load: async () => current,
    save: async (value) => {
      current = value
    },
  }
}

/** A journal held in memory only, empty by default. */
export const createMemoryJournalStore = (initial: Journal = emptyJournal): JournalStore =>
  createMemoryStore(initial)
