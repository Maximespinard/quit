import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

/**
 * The database schema. A change here ships as a new migration: `npm run db:generate` writes it
 * to `drizzle/`, and the server applies it at start.
 */

/**
 * Device keys, as SHA-256 hashes only: the key itself is shown once when issued and never
 * stored. Issuing a key revokes the active one; the partial unique index keeps at most one
 * row unrevoked.
 */
export const deviceKeys = sqliteTable(
  'device_keys',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    /** Hex SHA-256 of the key. */
    hash: text('hash').notNull().unique(),
    issuedAt: integer('issued_at', { mode: 'timestamp_ms' }).notNull(),
    revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    uniqueIndex('device_keys_one_active')
      .on(sql`(${table.revokedAt} IS NULL)`)
      .where(sql`${table.revokedAt} IS NULL`),
  ],
)
