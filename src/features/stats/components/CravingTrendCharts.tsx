import { CRAVING_INTENSITIES } from '@quit/contract/facts'
import type { CravingTrend } from '@/shared/domain/craving-stats'
import { formatDose, formatShortDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import type { ChartMark } from '../types/charts'
import { bucketLabel, stepMarkers } from '../utils/stats-labels'
import { ColumnChart } from './ColumnChart'

const copy = strings.stats.trend

/** The intensity chart's fixed scale: the strongest intensity, not the strongest week. */
const MAX_INTENSITY = Math.max(...CRAVING_INTENSITIES)

/**
 * The trend as two charts on one time axis, never one chart with two scales: how many
 * cravings, then how strong on average. The protocol's step changes rule both. Weeks are
 * compared per day, so the oldest one, shorter, does not read as a dip.
 */
export function CravingTrendCharts({ trend }: { trend: CravingTrend }) {
  const { buckets, period, stepChanges } = trend
  const first = buckets[0]
  if (first === undefined || buckets.length < 2) {
    return <p className="text-body text-muted">{copy.single}</p>
  }
  const last = buckets.length - 1
  const ticks: readonly ChartMark[] = [
    { index: 0, label: formatShortDate(first.start) },
    { index: last, label: copy.today },
  ]
  const markers = stepMarkers(stepChanges)
  const countTitle = period === 'day' ? copy.countByDay : copy.countByWeek

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-label text-muted">{countTitle}</h3>
        <ColumnChart
          label={countTitle}
          columns={buckets.map((bucket) => ({
            label: bucketLabel(bucket, period),
            value: bucket.count / bucket.days,
            valueText:
              period === 'day'
                ? strings.stats.cravings(bucket.count)
                : copy.weekCount(bucket.count, bucket.count / bucket.days),
          }))}
          ticks={ticks}
          markers={markers}
          restingIndex={last}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-label text-muted">{copy.intensity}</h3>
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
            return bucket === undefined ? null : (
              <li key={stepNumber}>
                {copy.stepChangeAt(stepNumber, formatDose(doseMg), bucketLabel(bucket, period))}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
