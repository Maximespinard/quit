import { type DBSchema, openDB } from 'idb'
import { type BackupRecord, decodeBackupRecord } from '@/shared/domain/backup-reminder'
import { decodeJournal, type Journal } from '@/shared/domain/journal'

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
/** 2 adds the backup record beside the journal. */
const DB_VERSION = 2
/** One person, one journal: a single record per store, under a fixed key. */
const KEY = 'current'

const open = () =>
  openDB<QuitDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) db.createObjectStore('journal')
      if (oldVersion < 2) db.createObjectStore('backup')
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
  load: async () => decodeJournal(await read('journal')),
  save: (journal) => write('journal', journal),
}

/** When the real journal was last exported, on the device; never read by the sandbox. */
export const deviceBackupStore: BackupStore = {
  load: async () => decodeBackupRecord(await read('backup')),
  save: (record) => write('backup', record),
}
