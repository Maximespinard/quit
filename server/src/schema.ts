import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

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

/**
 * The one web push subscription the app registered, as the browser's `toJSON()` gives it.
 * Registering another replaces it; the check keeps it a single row.
 */
export const pushSubscription = sqliteTable(
  'push_subscription',
  {
    id: integer('id').primaryKey(),
    endpoint: text('endpoint').notNull(),
    /** Epoch ms, or null when the subscription does not expire. */
    expirationTime: real('expiration_time'),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
  },
  (table) => [check('push_subscription_single_row', sql`${table.id} = 1`)],
)

/**
 * The upcoming notifications of the schedule the app uploaded, ready-made: sent as they are
 * when `sendAt` comes, then removed. Uploading a schedule replaces them all.
 */
export const scheduledNotifications = sqliteTable(
  'scheduled_notifications',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sendAt: integer('send_at', { mode: 'timestamp_ms' }).notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    /** The app route the notification opens. */
    screen: text('screen').notNull(),
  },
  (table) => [index('scheduled_notifications_send_at').on(table.sendAt)],
)
