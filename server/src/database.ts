import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Sqlite from 'better-sqlite3'
import { type BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema.ts'

export const DATABASE_FILE = 'quit.db'

/** How long a write waits for another connection's lock (the issue command) before failing. */
const BUSY_TIMEOUT_MS = 5_000

const MIGRATIONS_FOLDER = fileURLToPath(new URL('../drizzle', import.meta.url))

export type Db = BetterSQLite3Database<typeof schema>

export interface Database {
  db: Db
  /** Throws when the database cannot answer a query. */
  ping(): void
  close(): void
}

/**
 * Opens the SQLite database in `dataDir` (created when missing) and applies pending migrations.
 * WAL lets the issue command write while the server reads; foreign keys are off by default in
 * SQLite and turned on here.
 */
export function openDatabase(dataDir: string): Database {
  mkdirSync(dataDir, { recursive: true })
  const sqlite = new Sqlite(join(dataDir, DATABASE_FILE))
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma(`busy_timeout = ${BUSY_TIMEOUT_MS}`)
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle({ client: sqlite, schema })
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })

  return {
    db,
    ping: () => void sqlite.prepare('SELECT 1').get(),
    close: () => void sqlite.close(),
  }
}
