import { useId } from 'react'
import type { CravingStats } from '@/shared/domain/craving-stats'
import { cn } from '@/shared/utils/cn'
import { formatCount } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { percentOf, tagLabel } from '../utils/stats-labels'

const copy = strings.stats

/**
 * The headline figures, as the home's statement cards: how many cravings, how many held to
 * the end of the timer, the riskiest hour and the most frequent situation.
 */
export function StatsSummary({ stats }: { stats: CravingStats }) {
  const titleId = useId()
  const topTag = stats.byTag[0]
  const items = [
    { term: copy.count, value: formatCount(stats.count) },
    { term: copy.held, value: copy.percent(percentOf(stats.heldToEnd, stats.count)) },
    {
      term: copy.riskiestHour,
      value: stats.riskiestHour === null ? copy.none : copy.hour(stats.riskiestHour),
    },
    { term: copy.topTag, value: topTag === undefined ? copy.none : tagLabel(topTag.tag) },
  ]

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className="sr-only">
        {copy.summary}
      </h2>
      {/* One statement card, two by two: rules between the cells, never tiles. */}
      <dl className="grid grid-cols-2 rounded-card bg-surface">
        {items.map(({ term, value }, index) => (
          <div
            key={term}
            className={cn(
              'flex min-w-0 flex-col justify-between gap-1 px-4 py-3.5',
              index % 2 === 1 && 'border-line border-l',
              index >= 2 && 'border-line border-t',
            )}
          >
            <dt className="text-ink-dim text-label">{term}</dt>
            <dd className="truncate text-figure tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
