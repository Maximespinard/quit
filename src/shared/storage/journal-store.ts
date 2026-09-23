import { type DBSchema, openDB } from 'idb'
import { decodeJournal, type Journal } from '@/shared/domain/journal'

/** Where a journal is kept: the device for the real one, memory for the sandbox. */
export type JournalStore = {
  readonly load: () => Promise<Journal>
  readonly save: (journal: Journal) => Promise<void>
}

interface QuitDB extends DBSchema {
  journal: { key: string; value: unknown }
}

const DB_NAME = 'quit'
const DB_VERSION = 1
const STORE = 'journal'
/** One person, one journal: a single record under a fixed key. */
const KEY = 'current'

const open = () =>
  openDB<QuitDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE)
    },
  })

/** Reads the journal from the device; an unknown or empty store yields the empty journal. */
async function loadJournal(): Promise<Journal> {
  const db = await open()
  try {
    return decodeJournal(await db.get(STORE, KEY))
  } finally {
    db.close()
  }
}

async function saveJournal(journal: Journal): Promise<void> {
  const db = await open()
  try {
    await db.put(STORE, journal, KEY)
  } finally {
    db.close()
  }
}

/** The real journal, in IndexedDB on the device. */
export const deviceJournalStore: JournalStore = { load: loadJournal, save: saveJournal }
