import type { FactId } from '@quit/contract/facts'
import {
  latestQuitMoment,
  type QuitMomentRefusal,
  recordQuitMoment,
} from '@/shared/domain/facts/quit-moment'
import type { Journal, JournalOutcome } from '@/shared/domain/journal'
import { setBaselineSmokesPerDay, setWeeklySpend } from '@/shared/domain/journal-settings'
import { fromDatetimeLocal, toDatetimeLocal } from '@/shared/utils/datetime-local'
import { baselineInput, spendInput } from './value-inputs'

/** The settings form as its fields hold it: text, read only on save. */
export type SettingsFields = {
  readonly quitMoment: string
  readonly spend: string
  readonly baseline: string
}

/** Why each refused field was refused; a field absent from it was fine. */
export type SettingsRefusals = {
  readonly quitMoment?: QuitMomentRefusal | { readonly reason: 'invalid' }
  readonly spend?: true
  readonly baseline?: true
}

/** What is in force, as the fields show it. An unset value is an empty field, never a zero. */
export function settingsInForce(journal: Journal, now: number): SettingsFields {
  const textOf = (value: number | null, toText: (value: number) => string) =>
    value === null ? '' : toText(value)
  return {
    quitMoment: toDatetimeLocal(latestQuitMoment(journal) ?? now),
    spend: textOf(journal.weeklySpendCents, spendInput.toText),
    baseline: textOf(journal.baselineSmokesPerDay, baselineInput.toText),
  }
}

/** Saving what is already in force is no action. */
export const isChanged = (inForce: SettingsFields, fields: SettingsFields) =>
  fields.quitMoment !== inForce.quitMoment ||
  fields.spend !== inForce.spend ||
  fields.baseline !== inForce.baseline

/**
 * Applies every changed field to one journal, or refuses them all: one save, one outcome.
 * An untouched field is left alone, so an untouched quit moment keeps its seconds. A first
 * quit moment gets its id from `newId`.
 */
export function saveSettings(
  journal: Journal,
  inForce: SettingsFields,
  fields: SettingsFields,
  now: number,
  newId: () => FactId,
): JournalOutcome<{ readonly refusals: SettingsRefusals }> {
  let next = journal
  let refusals: SettingsRefusals = {}

  if (fields.quitMoment !== inForce.quitMoment) {
    const at = fromDatetimeLocal(fields.quitMoment)
    const result = at === null ? null : recordQuitMoment(next, at, now, newId)
    if (result === null) refusals = { ...refusals, quitMoment: { reason: 'invalid' } }
    else if (result.ok) next = result.journal
    else {
      const { ok: _, ...refusal } = result
      refusals = { ...refusals, quitMoment: refusal }
    }
  }
  if (fields.spend !== inForce.spend) {
    const result = setWeeklySpend(next, spendInput.read(fields.spend))
    if (result.ok) next = result.journal
    else refusals = { ...refusals, spend: true }
  }
  if (fields.baseline !== inForce.baseline) {
    const result = setBaselineSmokesPerDay(next, baselineInput.read(fields.baseline))
    if (result.ok) next = result.journal
    else refusals = { ...refusals, baseline: true }
  }

  return Object.keys(refusals).length === 0 ? { ok: true, journal: next } : { ok: false, refusals }
}
