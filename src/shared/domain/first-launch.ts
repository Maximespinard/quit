import type { FactId } from '@quit/contract/facts'
import { recordQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { setBaselineSmokesPerDay, setWeeklySpend } from './journal-settings'

/** What first launch asks for; the protocol is the journal's own, the default one untouched. */
export type JourneyStart = {
  readonly quitMoment: number
  readonly weeklySpendCents: number
  readonly baselineSmokesPerDay: number
}

export type StartJourneyResult =
  | { readonly ok: true; readonly journal: Journal }
  | {
      readonly ok: false
      readonly reason: 'future' | 'after-facts' | 'invalid-spend' | 'invalid-baseline'
    }

/**
 * Ends first launch in one step: the quit moment and both settings, or nothing at all.
 * There is no "not yet quit" state, so no journal holds settings without a quit moment. A
 * first quit moment gets its id from `newId`.
 */
export function startJourney(
  journal: Journal,
  start: JourneyStart,
  now: number,
  newId: () => FactId,
): StartJourneyResult {
  const spent = setWeeklySpend(journal, start.weeklySpendCents)
  if (!spent.ok) return spent
  const baselined = setBaselineSmokesPerDay(spent.journal, start.baselineSmokesPerDay)
  if (!baselined.ok) return baselined
  const recorded = recordQuitMoment(baselined.journal, start.quitMoment, now, newId)
  return recorded.ok ? recorded : { ok: false, reason: recorded.reason }
}
