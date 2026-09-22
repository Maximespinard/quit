import { type DBSchema, openDB } from 'idb'
import { decodeJournal, type Journal } from '@/shared/domain/journal'

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
export async function loadJournal(): Promise<Journal> {
  const db = await open()
  try {
    return decodeJournal(await db.get(STORE, KEY))
  } finally {
    db.close()
  }
}

export async function saveJournal(journal: Journal): Promise<void> {
  const db = await open()
  try {
    await db.put(STORE, journal, KEY)
  } finally {
    db.close()
  }
}
