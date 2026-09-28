import { APPLICATION_SITES, type ApplicationSite } from './application-site'
import { PATCH_APPLICATION } from './facts/patch-application'
import type { Journal } from './journal'

/**
 * The site after the latest one a patch application carried, in time order — a backdated one
 * counts where it falls, not where it was recorded — so it is never the previous patch
 * application's site. One without a site is passed over; with none at all, the first site.
 * A patch application later than `now` has not happened yet; on a tie, the one recorded last
 * wins. Only reachable through `derive`.
 */
export function suggestedSite(journal: Journal, now: number): ApplicationSite {
  let latest: { readonly at: number; readonly site: ApplicationSite } | null = null
  for (const fact of journal.facts) {
    if (fact.type !== PATCH_APPLICATION || fact.site === undefined || fact.at > now) continue
    if (latest === null || fact.at >= latest.at) latest = { at: fact.at, site: fact.site }
  }
  if (latest === null) return APPLICATION_SITES[0]
  const next = (APPLICATION_SITES.indexOf(latest.site) + 1) % APPLICATION_SITES.length
  return APPLICATION_SITES[next] ?? APPLICATION_SITES[0]
}
