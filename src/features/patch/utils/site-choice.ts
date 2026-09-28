import type { ApplicationSite } from '@/shared/domain/application-site'
import type { PatchApplicationInput } from '@/shared/domain/facts/patch-application'

/** The site as the user left it: untouched, it follows the suggestion; picked, it may be none. */
export type SiteChoice =
  | { readonly kind: 'suggested' }
  | { readonly kind: 'picked'; readonly site: ApplicationSite | null }

export const untouched: SiteChoice = { kind: 'suggested' }

export const chosenSite = (
  choice: SiteChoice,
  suggested: ApplicationSite | null,
): ApplicationSite | null => (choice.kind === 'suggested' ? suggested : choice.site)

/** The patch application to record, without a site when none is chosen. */
export const applicationAt = (
  at: number,
  doseMg: number,
  site: ApplicationSite | null,
): PatchApplicationInput => (site === null ? { at, doseMg } : { at, doseMg, site })
