import { useId } from 'react'
import {
  APPLICATION_SITES,
  type ApplicationSite,
  isApplicationSite,
} from '@/shared/domain/application-site'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/base/toggle-group'
import { cn } from '@/shared/utils/cn'
import { strings } from '@/shared/utils/strings'

const copy = strings.patch

type SitePickerProps = {
  /** `null` logs the patch application without a site. */
  value: ApplicationSite | null
  onValueChange: (site: ApplicationSite | null) => void
  /** On a `surface` card, secondary text darkens to `ink-dim` to keep its contrast. */
  onSurface?: boolean
}

/**
 * The application site, one of the fixed list: one site pressed at most. Another site is one
 * tap; pressing the pressed one again leaves the site out. Two columns, left and right, one
 * row per body area.
 */
export function SitePicker({ value, onValueChange, onSurface = false }: SitePickerProps) {
  const secondary = onSurface ? 'text-ink-dim' : 'text-ink-soft'

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
        className="grid w-full grid-cols-2"
        value={value === null ? [] : [value]}
        onValueChange={(sites: string[]) => onValueChange(sites.find(isApplicationSite) ?? null)}
      >
        {APPLICATION_SITES.map((site) => (
          <ToggleGroupItem key={site} value={site} className={cn('h-11 w-full', secondary)}>
            {copy.sites[site]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p id={hintId} className={cn('text-label', secondary)}>
        {copy.site.hint}
      </p>
    </div>
  )
}
