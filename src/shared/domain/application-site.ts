/**
 * The body areas a patch goes on, in the order the suggestion rotates through them. Stored by
 * id; their French labels live in the strings module.
 */
export const APPLICATION_SITES = [
  'arm-left',
  'arm-right',
  'chest-left',
  'chest-right',
  'hip-left',
  'hip-right',
] as const

export type ApplicationSite = (typeof APPLICATION_SITES)[number]

export const isApplicationSite = (value: unknown): value is ApplicationSite =>
  APPLICATION_SITES.some((site) => site === value)
