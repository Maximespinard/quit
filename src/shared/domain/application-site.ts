import { type ApplicationSite, applicationSiteSchema } from '@quit/contract/facts'

export const isApplicationSite = (value: unknown): value is ApplicationSite =>
  applicationSiteSchema.safeParse(value).success
