import { localMidnight } from '@/shared/domain/local-day'
import { strings } from '@/shared/utils/strings'

const sameYear = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const otherYear = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** The heading of a history day, `day` being its local midnight: relative while it is recent. */
export function dayHeading(day: number, now: number): string {
  if (day === localMidnight(now)) return strings.history.today
  if (day === localMidnight(now, -1)) return strings.history.yesterday
  const format = new Date(day).getFullYear() === new Date(now).getFullYear() ? sameYear : otherYear
  return format.format(day)
}
