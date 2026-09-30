import type { CalendarDay } from '@/shared/domain/patch-calendar'
import { formatDose, formatWeekdayDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

const copy = strings.calendar

const monthYear = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

/** `Janvier 2026`: a month grid's title. */
export function formatMonth(month: number): string {
  const text = monthYear.format(month)
  return text.charAt(0).toLocaleUpperCase('fr-FR') + text.slice(1)
}

/** One day as a screen reader hears it: the date, then what it holds. */
export function describeDay(day: CalendarDay): string {
  const said = copy.day
  const parts = [
    formatWeekdayDate(day.day),
    day.isToday ? said.today : null,
    day.startingStep !== null && day.step !== null
      ? said.stepStart(day.step, formatDose(day.startingStep.doseMg))
      : null,
    day.isEnd ? said.end : null,
    day.patch === null ? null : said[day.patch],
    day.cigarettes > 0 ? said.cigarettes(day.cigarettes) : null,
    day.cravings > 0 ? said.cravings(day.cravings) : null,
  ]
  return parts.filter((part) => part !== null).join(', ')
}
