import { useId } from 'react'
import {
  APPLICATION_SITES,
  type ApplicationSite,
  isApplicationSite,
} from '@/shared/domain/application-site'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/base/toggle-group'
import { strings } from '@/shared/utils/strings'

const copy = strings.patch

type SitePickerProps = {
  /** `null` logs the patch application without a site. */
  value: ApplicationSite | null
  onValueChange: (site: ApplicationSite | null) => void
}

/**
 * The application site, one of the fixed list: one site pressed at most. Another site is one
 * tap; pressing the pressed one again leaves the site out.
 */
export function SitePicker({ value, onValueChange }: SitePickerProps) {
  const labelId = useId()
  const hintId = useId()

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-label">
        {copy.site.label}
      </span>
      <ToggleGroup
        aria-labelledby={labelId}
        aria-describedby={hintId}
        variant="outline"
        className="w-full flex-wrap"
        value={value === null ? [] : [value]}
        onValueChange={(sites: string[]) => onValueChange(sites.find(isApplicationSite) ?? null)}
      >
        {APPLICATION_SITES.map((site) => (
          <ToggleGroupItem key={site} value={site} className="h-11">
            {copy.sites[site]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p id={hintId} className="text-ink-soft text-label">
        {copy.site.hint}
      </p>
    </div>
  )
}
