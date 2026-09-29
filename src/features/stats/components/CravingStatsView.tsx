import { CRAVING_INTENSITIES } from '@quit/contract/facts'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { type CravingStats, MIN_CRAVINGS_FOR_STATS } from '@/shared/domain/craving-stats'
import { buttonVariants } from '@/shared/ui/base/button'
import { Card } from '@/shared/ui/Card'
import { keepSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'
import { tagLabel } from '../utils/stats-labels'
import { BarList } from './BarList'
import { ColumnChart } from './ColumnChart'
import { CravingTrendCharts } from './CravingTrendCharts'
import { StatsSummary } from './StatsSummary'

const copy = strings.stats

/** The hours the axis names: every six, from midnight. */
const HOUR_TICKS = [0, 6, 12, 18]

/**
 * When and why cravings happen, and whether they fade. Short of enough cravings, one sentence
 * says what will appear instead of a chart drawn from too little.
 */
export function CravingStatsView({ stats }: { stats: CravingStats }) {
  if (stats.count < MIN_CRAVINGS_FOR_STATS) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-body text-muted">
          {stats.count === 0
            ? copy.empty(MIN_CRAVINGS_FOR_STATS)
            : copy.sparse(stats.count, MIN_CRAVINGS_FOR_STATS)}
        </p>
        {/* A craving had away from the phone counts too: the way to the charts starts here. */}
        <Link
          to="/craving/past"
          search={keepSearch}
          className={buttonVariants({ variant: 'secondary' })}
        >
          {strings.craving.logPast}
        </Link>
      </div>
    )
  }
  const tagRows = [
    ...stats.byTag.map(({ tag, count }) => ({ key: `tag:${tag}`, label: tagLabel(tag), count })),
    ...(stats.untagged > 0
      ? [{ key: 'untagged', label: copy.untagged, count: stats.untagged, muted: true }]
      : []),
  ]

  return (
    <div className="flex flex-col gap-2.5">
      <StatsSummary stats={stats} />
      <StatsSection title={copy.byHour}>
        <ColumnChart
          label={copy.byHour}
          columns={stats.byHour.map((count, hour) => ({
            label: copy.hourSpan(hour),
            value: count,
            valueText: copy.cravings(count),
          }))}
          ticks={HOUR_TICKS.map((hour) => ({ index: hour, label: copy.hour(hour) }))}
          restingIndex={stats.riskiestHour ?? 0}
        />
      </StatsSection>
      <StatsSection title={copy.byTag}>
        <BarList rows={tagRows} max={Math.max(...tagRows.map((row) => row.count))} />
      </StatsSection>
      <StatsSection title={copy.byIntensity.title}>
        <BarList
          rows={CRAVING_INTENSITIES.map((intensity) => ({
            key: String(intensity),
            label: copy.byIntensity.levels[intensity],
            count: stats.byIntensity[intensity],
          }))}
          max={Math.max(...Object.values(stats.byIntensity))}
        />
      </StatsSection>
      <StatsSection title={copy.trend.title}>
        <CravingTrendCharts trend={stats.trend} />
      </StatsSection>
    </div>
  )
}

/** One chart in its card, named in the card's muted label like the home's blocks. */
function StatsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card title={title} headingLevel={3}>
      {children}
    </Card>
  )
}
