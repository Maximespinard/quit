import { localMidnight } from '@/shared/domain/local-day'
import type { CalendarDay } from '../domain/patch-calendar'

/** One date of a month grid; `calendarDay` is `null` outside the calendar's range. */
export type MonthCell = { readonly day: number; readonly calendarDay: CalendarDay | null }

/** A month as a Monday-first grid: `null` pads the first and the last week. */
export type CalendarMonth = {
  /** Local midnight of its first day. */
  readonly month: number
  readonly weeks: readonly (readonly (MonthCell | null)[])[]
}

const firstOfMonth = (at: number) => {
  const date = new Date(at)
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

const nextMonth = (month: number) => {
  const date = new Date(month)
  return new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime()
}

/** Monday 0 … Sunday 6. */
const weekdayIndex = (day: number) => (new Date(day).getDay() + 6) % 7

function monthGrid(month: number, byDay: ReadonlyMap<number, CalendarDay>): CalendarMonth {
  const cells: (MonthCell | null)[] = Array.from({ length: weekdayIndex(month) }, () => null)
  const end = nextMonth(month)
  for (let day = month; day < end; day = localMidnight(day, 1))
    cells.push({ day, calendarDay: byDay.get(day) ?? null })
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (MonthCell | null)[][] = []
  for (let start = 0; start < cells.length; start += 7) weeks.push(cells.slice(start, start + 7))
  return { month, weeks }
}

/** Every month the calendar's days touch, whole, oldest first; none without a day. */
export function calendarMonths(days: readonly CalendarDay[]): readonly CalendarMonth[] {
  const first = days[0]
  const last = days.at(-1)
  if (first === undefined || last === undefined) return []
  const byDay = new Map(days.map((day) => [day.day, day]))
  const months: CalendarMonth[] = []
  for (let month = firstOfMonth(first.day); month <= last.day; month = nextMonth(month))
    months.push(monthGrid(month, byDay))
  return months
}

/** The month holding `now`, or the nearest one of `months` when `now` falls outside them. */
export function monthIndexAt(months: readonly CalendarMonth[], now: number): number {
  const month = firstOfMonth(now)
  const index = months.findIndex((candidate) => candidate.month === month)
  if (index !== -1) return index
  const first = months[0]
  return first !== undefined && month < first.month ? 0 : Math.max(0, months.length - 1)
}
