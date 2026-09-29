import { PATCH_APPLICATION, type PatchApplicationFact } from '@quit/contract/facts'
import type { Journal } from '../journal'
import { isValidDose } from '../protocol'
import { latestQuitMoment } from './quit-moment'

/** A patch application as the user reports it: when, at what dose, where. */
export type PatchApplication = Omit<PatchApplicationFact, 'type' | 'id'>

/** A patch application to record: a new one under a new id, a corrected one under its own. */
export type PatchApplicationInput = Omit<PatchApplicationFact, 'type'>

export type RecordPatchApplicationResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'future' | 'before-quit-moment' | 'invalid-dose' }

/**
 * Records a patch application. Refused after `now` (nothing happened yet), before the quit
 * moment (the protocol starts there) and without a positive dose.
 */
export function recordPatchApplication(
  journal: Journal,
  application: PatchApplicationInput,
  now: number,
): RecordPatchApplicationResult {
  if (!isValidDose(application.doseMg)) return { ok: false, reason: 'invalid-dose' }
  if (application.at > now) return { ok: false, reason: 'future' }
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null || application.at < quitMoment)
    return { ok: false, reason: 'before-quit-moment' }
  return {
    ok: true,
    journal: {
      ...journal,
      facts: [...journal.facts, { type: PATCH_APPLICATION, ...application }],
    },
  }
}
