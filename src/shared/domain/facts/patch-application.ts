import { type ApplicationSite, isApplicationSite } from '../application-site'
import type { Journal } from '../journal'
import { isValidDose } from '../protocol'
import { latestQuitMoment } from './quit-moment'

export const PATCH_APPLICATION = 'patch-application' as const

/** A patch put on, at a given time and dose. The dose may differ from the step's. */
export type PatchApplicationFact = {
  readonly type: typeof PATCH_APPLICATION
  readonly at: number
  readonly doseMg: number
  /** Where it went on; absent when the user logged it without one. */
  readonly site?: ApplicationSite
}

export const patchApplicationModule = {
  type: PATCH_APPLICATION,
  /** Turns a stored value back into a fact, or `null` when it is not one. */
  decode(raw: unknown): PatchApplicationFact | null {
    if (typeof raw !== 'object' || raw === null) return null
    const { type, at, doseMg, site } = raw as Record<string, unknown>
    if (type !== PATCH_APPLICATION || typeof at !== 'number' || !Number.isFinite(at)) return null
    if (typeof doseMg !== 'number' || !isValidDose(doseMg)) return null
    // A patch application stored before sites existed carries none.
    if (site === undefined) return { type: PATCH_APPLICATION, at, doseMg }
    if (!isApplicationSite(site)) return null
    return { type: PATCH_APPLICATION, at, doseMg, site }
  },
}

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
