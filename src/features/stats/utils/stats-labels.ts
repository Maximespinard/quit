import type { TrendBucket } from '@/shared/domain/craving-stats'
import { HOUR_MS } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'

const defaultTagLabels: Readonly<Record<string, string>> = strings.craving.tags.defaults

/** A tag as the screen shows it: a default tag's French label, a typed tag's own words. */
export const tagLabel = (tag: string): string => defaultTagLabels[tag] ?? tag

/** A whole percentage of `whole`, 0 when there is nothing to divide. */
export const percentOf = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 100)

/** A local calendar date, short: `4 mai`. */
export const shortDate = (ms: number): string =>
  new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

/** What a trend bucket covers: `4 mai`, or `8 mai – 14 mai`. */
export const bucketLabel = ({ start, end }: TrendBucket, period: 'day' | 'week'): string =>
  period === 'day'
    ? shortDate(start)
    : // `end` is the next day's midnight: an hour back lands on the last day, whatever the DST.
      strings.stats.trend.week(shortDate(start), shortDate(end - HOUR_MS))
