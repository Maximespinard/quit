import type { CalendarDay } from '@/shared/domain/patch-calendar'
import type { Step } from '@/shared/domain/protocol'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

const copy = strings.calendar

const weekdayDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const monthYear = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

/** `jeudi 29 janvier`. */
export const formatWeekdayDate = (at: number) => weekdayDate.format(at)

/** `29 janv.` */
export const formatShortDate = (at: number) => shortDate.format(at)

/** `Janvier 2026`: a month grid's title. */
export function formatMonth(month: number): string {
  const text = monthYear.format(month)
  return text.charAt(0).toLocaleUpperCase('fr-FR') + text.slice(1)
}

/**
 * One day as a screen reader hears it: the date, then what it holds.
 * `steps` gives the dose of a step beginning that day.
 */
export function describeDay(day: CalendarDay, steps: readonly Step[]): string {
  const said = copy.day
  const stepBeginning = day.stepStart && day.step !== null ? steps[day.step - 1] : undefined
  const parts = [
    formatWeekdayDate(day.day),
    day.today ? said.today : null,
    stepBeginning !== undefined && day.step !== null
      ? said.stepStart(day.step, formatDose(stepBeginning.doseMg))
      : null,
    day.end ? said.end : null,
    day.patch === null ? null : said[day.patch],
    day.cigarettes > 0 ? said.cigarettes(day.cigarettes) : null,
    day.cravings > 0 ? said.cravings(day.cravings) : null,
  ]
  return parts.filter((part) => part !== null).join(', ')
}
