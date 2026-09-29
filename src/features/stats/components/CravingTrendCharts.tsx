import type { CravingTrend } from '@/shared/domain/craving-stats'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { bucketLabel, shortDate } from '../utils/stats-labels'
import { type ChartMark, ColumnChart } from './ColumnChart'

const copy = strings.stats.trend

/** The highest average intensity: the intensity chart's scale is fixed, not the tallest week. */
const MAX_INTENSITY = 3

/**
 * The trend as two charts on one time axis, never one chart with two scales: how many
 * cravings, then how strong on average. The protocol's step changes rule both.
 */
export function CravingTrendCharts({ trend }: { trend: CravingTrend }) {
  const { buckets, period, stepChanges } = trend
  const first = buckets[0]
  if (first === undefined || buckets.length < 2) {
    return <p className="text-body text-ink-soft">{copy.single}</p>
  }
  const last = buckets.length - 1
  const ticks: readonly ChartMark[] = [
    { index: 0, label: shortDate(first.start) },
    { index: last, label: copy.today },
  ]
  const markers = stepChanges.map(({ bucketIndex, doseMg }) => ({
    index: bucketIndex,
    label: copy.stepChange(formatDose(doseMg)),
  }))
  const countTitle = period === 'day' ? copy.countByDay : copy.countByWeek

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-label text-ink-soft">{countTitle}</h3>
        <ColumnChart
          label={countTitle}
          columns={buckets.map((bucket) => ({
            label: bucketLabel(bucket, period),
            value: bucket.count,
            valueText: strings.stats.cravings(bucket.count),
          }))}
          ticks={ticks}
          markers={markers}
          restingIndex={last}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-label text-ink-soft">{copy.intensity}</h3>
        <ColumnChart
          label={copy.intensity}
          columns={buckets.map((bucket) => ({
            label: bucketLabel(bucket, period),
            value: bucket.averageIntensity ?? 0,
            valueText:
              bucket.averageIntensity === null
                ? copy.noIntensity
                : copy.average(bucket.averageIntensity),
          }))}
          max={MAX_INTENSITY}
          ticks={ticks}
          markers={markers}
          restingIndex={last}
        />
      </div>
      {stepChanges.length > 0 ? (
        <ul className="sr-only">
          {stepChanges.map(({ bucketIndex, stepNumber, doseMg }) => {
            const bucket = buckets[bucketIndex]
            const when = bucket === undefined ? '' : ` · ${bucketLabel(bucket, period)}`
            return (
              <li key={stepNumber}>
                {copy.stepChangeLabel(stepNumber, formatDose(doseMg))}
                {when}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
