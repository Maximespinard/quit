import type { CravingTrend, StepChange, TrendBucket } from '@/shared/domain/craving-stats'
import { HOUR_MS } from '@/shared/utils/duration'
import { formatDose, formatShortDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import type { ChartMark } from '../types/charts'

const defaultTagLabels: Readonly<Record<string, string>> = strings.craving.tags.defaults

/** A tag as the screen shows it: a default tag's French label, a typed tag's own words. */
export const tagLabel = (tag: string): string => defaultTagLabels[tag] ?? tag

/** The hours the axis names: every six, from midnight. */
export const HOUR_TICKS: readonly ChartMark[] = [0, 6, 12, 18].map((hour) => ({
  index: hour,
  label: strings.stats.hour(hour),
}))

/** A whole percentage of `whole`, 0 when there is nothing to divide. */
export const percentOf = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 100)

/** What a trend bucket covers: `4 mai`, or its first and last days, `8 mai – 14 mai`. */
export const bucketLabel = ({ start, end }: TrendBucket, period: CravingTrend['period']): string =>
  period === 'day'
    ? formatShortDate(start)
    : // `end` is the next day's midnight: an hour back lands on the last day, whatever the DST.
      strings.stats.trend.week(formatShortDate(start), formatShortDate(end - HOUR_MS))

/**
 * One rule per bucket holding a step change; two steps starting in the same week share it:
 * `14 → 7 mg`.
 */
export function stepMarkers(stepChanges: readonly StepChange[]): readonly ChartMark[] {
  const dosesByBucket = new Map<number, string[]>()
  for (const { bucketIndex, doseMg } of stepChanges) {
    dosesByBucket.set(bucketIndex, [...(dosesByBucket.get(bucketIndex) ?? []), formatDose(doseMg)])
  }
  return [...dosesByBucket].map(([index, doses]) => ({
    index,
    label: strings.stats.trend.stepChange(doses),
  }))
}
