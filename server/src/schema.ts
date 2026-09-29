import {
  APPLICATION_SITES,
  CRAVING,
  CRAVING_INTENSITIES,
  FACT_TYPES,
  type FactType,
  LAPSE,
  PATCH_APPLICATION,
  QUIT_MOMENT,
} from '@quit/contract/facts'
import { type SQL, sql } from 'drizzle-orm'
import {
  check,
  integer,
  primaryKey,
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

/** A constant as an SQL literal, for the checks below; only the contract's own values. */
const literal = (value: string | number) =>
  sql.raw(typeof value === 'number' ? String(value) : `'${value}'`)
const literals = (values: readonly (string | number)[]) => sql.join(values.map(literal), sql`, `)
const all = (...conditions: SQL[]) => sql.join(conditions, sql` AND `)

/**
 * The mirror's facts (ADR-0003): the columns every fact has, then one group of nullable columns
 * per fact type. A check per type keeps a row's columns to its own type's, filled in as the
 * contract requires; the server checks shape only, never a domain rule. A new fact type is a
 * new migration.
 */
export const facts = sqliteTable(
  'facts',
  {
    /** The UUIDv7 the device gave the fact; a correction keeps it. */
    id: text('id').primaryKey(),
    type: text('type', { enum: FACT_TYPES }).notNull(),
    /** When the fact happened on the device, in ms since the epoch. */
    at: integer('at').notNull(),
    /** When the server first stored this fact, then when it last replaced it. */
    receivedAt: integer('received_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
    /** Craving. */
    intensity: integer('intensity'),
    heldToEnd: integer('held_to_end', { mode: 'boolean' }),
    /** Patch application: any positive dose, a cut patch giving a half one. */
    doseMg: real('dose_mg'),
    site: text('site', { enum: APPLICATION_SITES }),
    /** Lapse: whole cigarettes. */
    count: integer('count'),
  },
  (table) => {
    const noCraving = all(sql`${table.intensity} IS NULL`, sql`${table.heldToEnd} IS NULL`)
    const noPatch = all(sql`${table.doseMg} IS NULL`, sql`${table.site} IS NULL`)
    const noLapse = sql`${table.count} IS NULL`
    /** Rows of `type` meet every condition; rows of another type are not concerned. */
    const forType = (type: FactType, ...conditions: SQL[]) =>
      sql`${table.type} <> ${literal(type)} OR (${all(...conditions)})`
    return [
      check('facts_type', sql`${table.type} IN (${literals(FACT_TYPES)})`),
      check('facts_quit_moment', forType(QUIT_MOMENT, noCraving, noPatch, noLapse)),
      check(
        'facts_craving',
        forType(
          CRAVING,
          sql`${table.intensity} IS NOT NULL`,
          sql`${table.intensity} IN (${literals(CRAVING_INTENSITIES)})`,
          sql`${table.heldToEnd} IS NOT NULL`,
          sql`${table.heldToEnd} IN (0, 1)`,
          noPatch,
          noLapse,
        ),
      ),
      check(
        'facts_patch_application',
        forType(
          PATCH_APPLICATION,
          sql`${table.doseMg} IS NOT NULL`,
          sql`${table.doseMg} > 0`,
          sql`(${table.site} IS NULL OR ${table.site} IN (${literals(APPLICATION_SITES)}))`,
          noCraving,
          noLapse,
        ),
      ),
      check(
        'facts_lapse',
        forType(
          LAPSE,
          sql`${table.count} IS NOT NULL`,
          sql`${table.count} >= 1`,
          noCraving,
          noPatch,
        ),
      ),
    ]
  },
)

/** A craving's tags, in the order the device holds them; they go with their craving. */
export const cravingTags = sqliteTable(
  'craving_tags',
  {
    factId: text('fact_id')
      .notNull()
      .references(() => facts.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    /** A default tag id or the user's own words. */
    tag: text('tag').notNull(),
  },
  (table) => [primaryKey({ columns: [table.factId, table.position] })],
)

/** The id of the one settings row. */
export const SETTINGS_ROW_ID = 1

/** The one settings row: `null` columns are settings not set yet, a `null` goal label no goal. */
export const settings = sqliteTable(
  'settings',
  {
    id: integer('id').primaryKey(),
    weeklySpendCents: integer('weekly_spend_cents'),
    baselineSmokesPerDay: integer('baseline_smokes_per_day'),
    goalLabel: text('goal_label'),
    goalPriceCents: integer('goal_price_cents'),
    goalCountsFrom: integer('goal_counts_from'),
    goalCelebrated: integer('goal_celebrated', { mode: 'boolean' }),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    check('settings_single_row', sql`${table.id} = ${literal(SETTINGS_ROW_ID)}`),
    check(
      'settings_weekly_spend_cents',
      sql`${table.weeklySpendCents} IS NULL OR ${table.weeklySpendCents} > 0`,
    ),
    check(
      'settings_baseline_smokes_per_day',
      sql`${table.baselineSmokesPerDay} IS NULL OR ${table.baselineSmokesPerDay} > 0`,
    ),
    check(
      'settings_goal',
      sql`(${all(
        sql`${table.goalLabel} IS NULL`,
        sql`${table.goalPriceCents} IS NULL`,
        sql`${table.goalCountsFrom} IS NULL`,
        sql`${table.goalCelebrated} IS NULL`,
      )}) OR (${all(
        sql`${table.goalLabel} IS NOT NULL`,
        sql`${table.goalPriceCents} IS NOT NULL`,
        sql`${table.goalPriceCents} > 0`,
        sql`${table.goalCelebrated} IS NOT NULL`,
        sql`${table.goalCelebrated} IN (0, 1)`,
      )})`,
    ),
  ],
)

/** The protocol, one row per step, in order from position 0. Never empty once settings exist. */
export const protocolSteps = sqliteTable(
  'protocol_steps',
  {
    position: integer('position').primaryKey(),
    doseMg: real('dose_mg').notNull(),
    durationDays: integer('duration_days').notNull(),
    brand: text('brand'),
  },
  (table) => [
    check('protocol_steps_position', sql`${table.position} >= 0`),
    check('protocol_steps_dose_mg', sql`${table.doseMg} > 0`),
    check('protocol_steps_duration_days', sql`${table.durationDays} > 0`),
  ],
)
