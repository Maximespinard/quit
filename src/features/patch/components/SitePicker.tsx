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
  /** The previous patch application's site: shown, marked, never pressable. */
  previous: ApplicationSite | null
}

/**
 * The application site, one of the fixed list: one site pressed at most. Another site is one
 * tap; pressing the pressed one again leaves the site out. Two columns, left and right, one
 * row per body area. The previous site stays in its place, greyed and named as such: it is
 * `aria-disabled` rather than `disabled`, so it keeps its focus and its description.
 */
export function SitePicker({ value, onValueChange, previous }: SitePickerProps) {
  const labelId = useId()
  const hintId = useId()
  const previousId = useId()

  const change = (sites: string[]) => {
    const next = sites.find(isApplicationSite) ?? null
    // A key press on the previous site changes nothing, as a tap cannot reach it.
    if (next !== null && next === previous) return
    onValueChange(next)
  }

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
        onValueChange={change}
      >
        {APPLICATION_SITES.map((site) =>
          site === previous ? (
            <ToggleGroupItem
              key={site}
              value={site}
              aria-disabled
              aria-describedby={previousId}
              // Disabled fill: `ghost` / `muted`, no outline, no pointer.
              className="pointer-events-none h-11 w-full flex-col gap-0 border-transparent bg-ghost text-muted"
            >
              {copy.sites[site]}
              <span id={previousId} aria-hidden className="font-medium text-detail">
                {copy.site.previous}
              </span>
            </ToggleGroupItem>
          ) : (
            <ToggleGroupItem key={site} value={site} className="h-11 w-full text-muted">
              {copy.sites[site]}
            </ToggleGroupItem>
          ),
        )}
      </ToggleGroup>
      <p id={hintId} className="text-label text-muted">
        {copy.site.hint}
      </p>
    </div>
  )
}
