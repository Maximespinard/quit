import { cn } from '@/shared/utils/cn'
import { strings } from '@/shared/utils/strings'
import type { BarRow } from '../types/charts'

type BarListProps = {
  rows: readonly BarRow[]
  /** The count a full-width bar stands for. */
  max: number
}

/**
 * Categories as rows, the longest names included: the name and its count on one line, a thin
 * bar of one hue under them, scaled to `max`. Every value is written, so no reading depends on
 * the bar alone.
 */
export function BarList({ rows, max }: BarListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.key} className="flex flex-col gap-1.5">
          <p className="flex items-baseline justify-between gap-3 text-body">
            <span className={cn('min-w-0 truncate', row.muted === true && 'text-ink-soft')}>
              {row.label}
            </span>
            <span className="shrink-0 text-ink-soft text-label tabular-nums">
              <span aria-hidden>{row.count}</span>
              <span className="sr-only">{strings.stats.cravings(row.count)}</span>
            </span>
          </p>
          {/* Grown from a hairline baseline, rounded only at its data end. */}
          <div aria-hidden className="h-2 border-line border-l">
            <div
              className="h-full rounded-r-mark bg-action"
              // A row holding anything keeps a visible stub; an empty one draws nothing.
              style={{
                width:
                  row.count === 0 || max === 0 ? 0 : `max(0.5rem, ${(row.count / max) * 100}%)`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
