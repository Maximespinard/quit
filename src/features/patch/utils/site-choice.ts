import type { ApplicationSite } from '@quit/contract/facts'
import type { PatchApplicationInput } from '@/shared/domain/facts/patch-application'

/** The site as the user left it: untouched, it follows the suggestion; picked, it may be none. */
export type SiteChoice =
  | { readonly kind: 'suggested' }
  | { readonly kind: 'picked'; readonly site: ApplicationSite | null }

export const untouched: SiteChoice = { kind: 'suggested' }

/**
 * The site to record. A site picked that has since become the previous one (the date entered
 * moved) gives way to the suggestion, which never is.
 */
export const chosenSite = (
  choice: SiteChoice,
  suggested: ApplicationSite | null,
  previous: ApplicationSite | null,
): ApplicationSite | null =>
  choice.kind === 'picked' && (choice.site === null || choice.site !== previous)
    ? choice.site
    : suggested

/** The patch application to record, without a site when none is chosen. */
export const applicationAt = (
  at: number,
  doseMg: number,
  site: ApplicationSite | null,
): PatchApplicationInput => (site === null ? { at, doseMg } : { at, doseMg, site })
