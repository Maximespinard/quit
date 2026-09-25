import type { Journal } from '../journal'
import { latestQuitMoment } from './quit-moment'

export const LAPSE = 'lapse' as const

/** Any smoke inhaled after the quit moment. No threshold: one puff is a lapse. */
export type LapseFact = {
  readonly type: typeof LAPSE
  readonly at: number
}

export const lapseModule = {
  type: LAPSE,
  /** Turns a stored value back into a fact, or `null` when it is not one. */
  decode(raw: unknown): LapseFact | null {
    if (typeof raw !== 'object' || raw === null) return null
    const { type, at } = raw as { type?: unknown; at?: unknown }
    if (type !== LAPSE || typeof at !== 'number' || !Number.isFinite(at)) return null
    return { type: LAPSE, at }
  },
}

export type RecordLapseResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'future' | 'before-quit-moment' }

/**
 * Records a lapse. Refused after `now` (nothing happened yet) and before the quit moment
 * (smoking then was not a lapse) — so also while no quit moment exists.
 */
export function recordLapse(journal: Journal, at: number, now: number): RecordLapseResult {
  if (at > now) return { ok: false, reason: 'future' }
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null || at < quitMoment) return { ok: false, reason: 'before-quit-moment' }
  return { ok: true, journal: { ...journal, facts: [...journal.facts, { type: LAPSE, at }] } }
}

/**
 * The lapses that count at `now`, oldest first: at or after the quit moment (earlier ones
 * predate a corrected quit moment) and not after `now` (not happened yet on a moved clock).
 */
export function lapsesUntil(journal: Journal, quitMoment: number, now: number): number[] {
  return journal.facts
    .filter((fact) => fact.type === LAPSE && fact.at >= quitMoment && fact.at <= now)
    .map((fact) => fact.at)
    .sort((a, b) => a - b)
}
