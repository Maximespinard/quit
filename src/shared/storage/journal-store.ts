import { type DBSchema, openDB } from 'idb'
import { type BackupRecord, decodeBackupRecord } from '@/shared/domain/backup-reminder'
import { decodeJournal, identifyFacts, type Journal } from '@/shared/domain/journal'
import { decodeMirrorLink, type MirrorLink } from '@/shared/domain/mirror-link'
import { decodePendingChanges, type PendingChange } from '@/shared/domain/pending-changes'
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
  /** What the device keeps for the mirror: the pending changes and the link, one record each. */
  mirror: { key: 'pending' | 'link'; value: unknown }
}

const DB_NAME = 'quit'
/**
 * 2 adds the backup record beside the journal; 3 gives every stored fact an id; 4 adds the
 * pending changes and the mirror link.
 */
const DB_VERSION = 4
/** One person, one journal: a single record per store, under a fixed key. */
const KEY = 'current'

const open = () =>
  openDB<QuitDB>(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) db.createObjectStore('journal')
      if (oldVersion < 2) db.createObjectStore('backup')
      if (oldVersion < 4) db.createObjectStore('mirror')
      if (oldVersion >= 1 && oldVersion < 3) {
        // Within the upgrade transaction: the app never reads the journal half migrated.
        const journal = transaction.objectStore('journal')
        const stored = await journal.get(KEY)
        if (stored !== undefined) await journal.put(identifyFacts(stored, newFactId), KEY)
      }
    },
  })

type StoredRecord =
  | { store: 'journal' | 'backup'; key: typeof KEY }
  | { store: 'mirror'; key: 'pending' | 'link' }

async function read({ store, key }: StoredRecord): Promise<unknown> {
  const db = await open()
  try {
    return await db.get(store, key)
  } finally {
    db.close()
  }
}

async function write({ store, key }: StoredRecord, value: unknown): Promise<void> {
  const db = await open()
  try {
    await db.put(store, value, key)
  } finally {
    db.close()
  }
}

const JOURNAL: StoredRecord = { store: 'journal', key: KEY }
const BACKUP: StoredRecord = { store: 'backup', key: KEY }
const PENDING: StoredRecord = { store: 'mirror', key: 'pending' }
const LINK: StoredRecord = { store: 'mirror', key: 'link' }

/** The real journal, in IndexedDB on the device; an unknown or empty store yields the empty journal. */
export const deviceJournalStore: JournalStore = {
  load: async () => decodeJournal(await read(JOURNAL), newFactId),
  save: (journal) => write(JOURNAL, journal),
}

/** When the real journal was last exported, on the device; never read by the sandbox. */
export const deviceBackupStore: BackupStore = {
  load: async () => decodeBackupRecord(await read(BACKUP)),
  save: (record) => write(BACKUP, record),
}

/** The changes the mirror has not acknowledged yet, on the device: they survive a reload. */
export const devicePendingStore: Store<readonly PendingChange[]> = {
  load: async () => decodePendingChanges(await read(PENDING)),
  save: (pending) => write(PENDING, pending),
}

/** The device key this device reaches the mirror with, if any. Kept in the app's storage only. */
export const deviceLinkStore: Store<MirrorLink | null> = {
  load: async () => decodeMirrorLink(await read(LINK)),
  save: (link) => write(LINK, link),
}
