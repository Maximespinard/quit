import { type DBSchema, openDB } from 'idb'
import { type BackupRecord, decodeBackupRecord } from '@/shared/domain/backup-reminder'
import { decodeJournal, identifyFacts, type Journal } from '@/shared/domain/journal'
import { newFactId } from '@/shared/utils/fact-id'

/** Where a value is kept: the device for the real journal, memory for the sandbox. */
export type Store<T> = {
  readonly load: () => Promise<T>
  readonly save: (value: T) => Promise<void>
}

export type JournalStore = Store<Journal>
export type BackupStore = Store<BackupRecord>

interface QuitDB extends DBSchema {
  journal: { key: string; value: unknown }
  backup: { key: string; value: unknown }
}

const DB_NAME = 'quit'
/** 2 adds the backup record beside the journal; 3 gives every stored fact an id. */
const DB_VERSION = 3
/** One person, one journal: a single record per store, under a fixed key. */
const KEY = 'current'

const open = () =>
  openDB<QuitDB>(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) db.createObjectStore('journal')
      if (oldVersion < 2) db.createObjectStore('backup')
      if (oldVersion >= 1 && oldVersion < 3) {
        // Within the upgrade transaction: the app never reads the journal half migrated.
        const journal = transaction.objectStore('journal')
        const stored = await journal.get(KEY)
        if (stored !== undefined) await journal.put(identifyFacts(stored, newFactId), KEY)
      }
    },
  })

async function read(store: 'journal' | 'backup'): Promise<unknown> {
  const db = await open()
  try {
    return await db.get(store, KEY)
  } finally {
    db.close()
  }
}

async function write(store: 'journal' | 'backup', value: unknown): Promise<void> {
  const db = await open()
  try {
    await db.put(store, value, KEY)
  } finally {
    db.close()
  }
}

/** The real journal, in IndexedDB on the device; an unknown or empty store yields the empty journal. */
export const deviceJournalStore: JournalStore = {
  load: async () => decodeJournal(await read('journal'), newFactId),
  save: (journal) => write('journal', journal),
}

/** When the real journal was last exported, on the device; never read by the sandbox. */
export const deviceBackupStore: BackupStore = {
  load: async () => decodeBackupRecord(await read('backup')),
  save: (record) => write('backup', record),
}
