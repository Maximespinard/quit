import { localMidnight } from '@/shared/domain/local-day'
import { formatWeekdayDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

/** The heading of a history day, `day` being its local midnight: relative while it is recent. */
export function dayHeading(day: number, now: number): string {
  if (day === localMidnight(now)) return strings.history.today
  if (day === localMidnight(now, -1)) return strings.history.yesterday
  return formatWeekdayDate(day, new Date(day).getFullYear() !== new Date(now).getFullYear())
}
