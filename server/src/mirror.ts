import {
  CRAVING,
  type Fact,
  type FactId,
  factSchema,
  LAPSE,
  PATCH_APPLICATION,
  QUIT_MOMENT,
} from '@quit/contract/facts'
import type { Mirror } from '@quit/contract/mirror'
import { type Settings, settingsSchema } from '@quit/contract/settings'
import { asc, eq } from 'drizzle-orm'
import type { Db } from './database.ts'
import { cravingTags, facts, protocolSteps, SETTINGS_ROW_ID, settings } from './schema.ts'

/**
 * The mirror's store (ADR-0003): facts and settings as the device sends them, read back in the
 * journal's shape. Every write is one transaction, and replaying it changes nothing.
 */

/** The columns of each fact type, all `null` but the fact's own. */
function typedColumns(fact: Fact) {
  const none = { intensity: null, heldToEnd: null, doseMg: null, site: null, count: null }
  switch (fact.type) {
    case QUIT_MOMENT:
      return none
    case CRAVING:
      return { ...none, intensity: fact.intensity, heldToEnd: fact.heldToEnd }
    case PATCH_APPLICATION:
      return { ...none, doseMg: fact.doseMg, site: fact.site ?? null }
    case LAPSE:
      return { ...none, count: fact.count }
  }
}

/** Stores `fact` under `id`, or replaces the fact stored there: its first received time stays. */
export function putFact(db: Db, id: FactId, fact: Fact, now: Date) {
  const columns = { type: fact.type, at: fact.at, ...typedColumns(fact), updatedAt: now }
  db.transaction((tx) => {
    tx.insert(facts)
      .values({ id, receivedAt: now, ...columns })
      .onConflictDoUpdate({ target: facts.id, set: columns })
      .run()
    tx.delete(cravingTags).where(eq(cravingTags.factId, id)).run()
    if (fact.type === CRAVING && fact.tags.length > 0) {
      tx.insert(cravingTags)
        .values(fact.tags.map((tag, position) => ({ factId: id, position, tag })))
        .run()
    }
  })
}

/** Removes the fact stored under `id`, its tags with it; nothing happens when there is none. */
export function deleteFact(db: Db, id: FactId) {
  db.delete(facts).where(eq(facts.id, id)).run()
}

/** Replaces the whole settings, protocol steps included. */
export function putSettings(db: Db, next: Settings, now: Date) {
  const row = {
    weeklySpendCents: next.weeklySpendCents,
    baselineSmokesPerDay: next.baselineSmokesPerDay,
    goalLabel: next.goal?.label ?? null,
    goalPriceCents: next.goal?.priceCents ?? null,
    goalCountsFrom: next.goal?.countsFrom ?? null,
    goalCelebrated: next.goal?.celebrated ?? null,
    updatedAt: now,
  }
  db.transaction((tx) => {
    tx.insert(settings)
      .values({ id: SETTINGS_ROW_ID, ...row })
      .onConflictDoUpdate({ target: settings.id, set: row })
      .run()
    tx.delete(protocolSteps).run()
    tx.insert(protocolSteps)
      .values(
        next.protocol.map((step, position) => ({
          position,
          doseMg: step.doseMg,
          durationDays: step.durationDays,
          brand: step.brand ?? null,
        })),
      )
      .run()
  })
}

type FactRow = typeof facts.$inferSelect

/** A row back in the journal's shape, decoded through the contract like any other fact. */
function toFact(row: FactRow, tags: readonly string[]): Fact {
  const common = { type: row.type, id: row.id, at: row.at }
  switch (row.type) {
    case QUIT_MOMENT:
      return factSchema.parse(common)
    case CRAVING:
      return factSchema.parse({
        ...common,
        intensity: row.intensity,
        heldToEnd: row.heldToEnd,
        tags,
      })
    case PATCH_APPLICATION:
      return factSchema.parse({
        ...common,
        doseMg: row.doseMg,
        ...(row.site === null ? {} : { site: row.site }),
      })
    case LAPSE:
      return factSchema.parse({ ...common, count: row.count })
  }
}

function readSettings(db: Db): Settings | null {
  const row = db.select().from(settings).get()
  if (!row) return null
  const steps = db.select().from(protocolSteps).orderBy(asc(protocolSteps.position)).all()
  return settingsSchema.parse({
    protocol: steps.map(({ doseMg, durationDays, brand }) => ({
      doseMg,
      durationDays,
      ...(brand === null ? {} : { brand }),
    })),
    weeklySpendCents: row.weeklySpendCents,
    baselineSmokesPerDay: row.baselineSmokesPerDay,
    goal:
      row.goalLabel === null
        ? null
        : {
            label: row.goalLabel,
            priceCents: row.goalPriceCents,
            countsFrom: row.goalCountsFrom,
            celebrated: row.goalCelebrated,
          },
  })
}

/**
 * Everything the mirror holds: its facts ordered by time, then by id, and its settings. The
 * driver is synchronous and this process the only writer: no write lands between the reads.
 */
export function readMirror(db: Db): Mirror {
  const tagsByFact = new Map<string, string[]>()
  const tagRows = db
    .select()
    .from(cravingTags)
    .orderBy(asc(cravingTags.factId), asc(cravingTags.position))
    .all()
  for (const { factId, tag } of tagRows) {
    tagsByFact.set(factId, [...(tagsByFact.get(factId) ?? []), tag])
  }
  const rows = db.select().from(facts).orderBy(asc(facts.at), asc(facts.id)).all()
  return {
    facts: rows.map((row) => toFact(row, tagsByFact.get(row.id) ?? [])),
    settings: readSettings(db),
  }
}
