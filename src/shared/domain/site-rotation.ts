import { APPLICATION_SITES, type ApplicationSite, PATCH_APPLICATION } from '@quit/contract/facts'
import type { Journal } from './journal'

/** Where the next patch goes, and the site it may not take. */
export type SiteRotation = {
  /** The site after the latest one a patch application carried: never `previousSite`. */
  readonly suggestedSite: ApplicationSite
  /** The previous patch application's site; `null` when it has none, or there is none. */
  readonly previousSite: ApplicationSite | null
}

const after = (site: ApplicationSite): ApplicationSite =>
  APPLICATION_SITES[(APPLICATION_SITES.indexOf(site) + 1) % APPLICATION_SITES.length] ??
  APPLICATION_SITES[0]

/**
 * Patch applications in time order — a backdated one counts where it falls, not where it was
 * recorded. The suggestion rotates on from the latest site known, passing over one without a
 * site; with none at all, the first site. A patch application later than `now` has not happened
 * yet; on a tie, the one recorded last wins. Only reachable through `derive`.
 */
export function siteRotation(journal: Journal, now: number): SiteRotation {
  let previous: { readonly at: number; readonly site: ApplicationSite | null } | null = null
  let known: { readonly at: number; readonly site: ApplicationSite } | null = null
  for (const fact of journal.facts) {
    if (fact.type !== PATCH_APPLICATION || fact.at > now) continue
    if (previous === null || fact.at >= previous.at)
      previous = { at: fact.at, site: fact.site ?? null }
    if (fact.site !== undefined && (known === null || fact.at >= known.at))
      known = { at: fact.at, site: fact.site }
  }
  return {
    suggestedSite: known === null ? APPLICATION_SITES[0] : after(known.site),
    previousSite: previous?.site ?? null,
  }
}
