import { factIdSchema, factSchema } from '@quit/contract/facts'
import { type Settings, settingsSchema } from '@quit/contract/settings'
import * as z from 'zod/mini'
import type { Journal } from './journal'

/**
 * One change the mirror has to receive (ADR-0003): a fact stored or replaced under its id, a
 * fact deleted by its id, or the whole settings. Each is idempotent: sent twice, it lands once.
 */
const mirrorChangeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('put-fact'), fact: factSchema }),
  z.object({ kind: z.literal('delete-fact'), id: factIdSchema }),
  z.object({ kind: z.literal('put-settings'), settings: settingsSchema }),
])
export type MirrorChange = z.infer<typeof mirrorChangeSchema>

/**
 * A change recorded on the device that the mirror has not acknowledged yet. `seq` names this
 * version of it; `pendingSince` is when the mirror started lacking it.
 */
const pendingChangeSchema = z.object({
  seq: z.int(),
  pendingSince: z.number(),
  change: mirrorChangeSchema,
})
export type PendingChange = z.infer<typeof pendingChangeSchema>

/** What a change is about: one fact, or the settings. Two changes to it collapse into one. */
const target = (change: MirrorChange) => {
  switch (change.kind) {
    case 'put-fact':
      return change.fact.id
    case 'delete-fact':
      return change.id
    case 'put-settings':
      return 'settings'
  }
}

/** Whether two JSON-like values hold the same data, whatever the order of their keys. */
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const aEntries = Object.entries(a).filter(([, value]) => value !== undefined)
  const bEntries = Object.entries(b).filter(([, value]) => value !== undefined)
  if (aEntries.length !== bEntries.length) return false
  const bValues = new Map(bEntries)
  return aEntries.every(([key, value]) => bValues.has(key) && sameValue(value, bValues.get(key)))
}

/** Everything the journal holds but its facts: a setting added later is mirrored with the rest. */
const settingsOf = ({ facts: _facts, ...settings }: Journal): Settings => settings

/**
 * What the mirror needs to go from `before` to `after`: the facts deleted, then those recorded
 * or corrected in `after`'s order, then the settings if any of them changed. The only producer
 * of changes: recording, correcting, deleting, the settings and an import all go through it.
 */
export function journalChanges(before: Journal, after: Journal): MirrorChange[] {
  const beforeById = new Map(before.facts.map((fact) => [fact.id, fact]))
  const afterIds = new Set(after.facts.map((fact) => fact.id))
  const deleted: MirrorChange[] = before.facts
    .filter((fact) => !afterIds.has(fact.id))
    .map((fact) => ({ kind: 'delete-fact', id: fact.id }))
  const put: MirrorChange[] = after.facts
    .filter((fact) => !sameValue(fact, beforeById.get(fact.id)))
    .map((fact) => ({ kind: 'put-fact', fact }))
  const settings = settingsOf(after)
  const settingsPut: MirrorChange[] = sameValue(settingsOf(before), settings)
    ? []
    : [{ kind: 'put-settings', settings }]
  return [...deleted, ...put, ...settingsPut]
}

/**
 * `pending` with `changes` added at `now`. A change to a fact, or to the settings, already
 * waiting replaces the one before it where it stands, under a new `seq` and keeping its
 * `pendingSince`: the mirror has lacked it since then, and only its latest version ever leaves.
 */
export function addPendingChanges(
  pending: readonly PendingChange[],
  changes: readonly MirrorChange[],
  now: number,
): PendingChange[] {
  let waiting = [...pending]
  let seq = Math.max(0, ...waiting.map((change) => change.seq))
  for (const change of changes) {
    seq += 1
    const index = waiting.findIndex((older) => target(older.change) === target(change))
    const older = waiting[index]
    if (older === undefined) {
      waiting = [...waiting, { seq, pendingSince: now, change }]
    } else {
      waiting = waiting.with(index, { seq, pendingSince: older.pendingSince, change })
    }
  }
  return waiting
}

/**
 * `pending` once the mirror acknowledged the change `seq`. A change replaced while it was on its
 * way carries a new `seq`: it stays, and its latest version leaves next.
 */
export const acknowledgeChange = (
  pending: readonly PendingChange[],
  seq: number,
): PendingChange[] => pending.filter((change) => change.seq !== seq)

/** The pending changes as the device stored them; one it cannot read is dropped, not the rest. */
export function decodePendingChanges(raw: unknown): PendingChange[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((stored: unknown) => {
    const change = pendingChangeSchema.safeParse(stored)
    return change.success ? [change.data] : []
  })
}
