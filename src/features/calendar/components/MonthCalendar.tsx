import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useId, useState } from 'react'
import { localMidnight } from '@/shared/domain/local-day'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'
import type { CalendarDay } from '../domain/patch-calendar'
import { formatMonth } from '../utils/calendar-dates'
import { calendarMonths, monthIndexAt } from '../utils/calendar-months'
import { CalendarLegend } from './CalendarLegend'
import { DayCell } from './DayCell'

const copy = strings.calendar

/** A disabled pager control fades out instead of taking the disabled fill, which reads as selected. */
const pagerControl = 'disabled:bg-transparent disabled:opacity-30'

type MonthCalendarProps = {
  days: readonly CalendarDay[]
  now: number
}

/** One month at a time, opening on today's, paged within the calendar's range. */
export function MonthCalendar({ days, now }: MonthCalendarProps) {
  const titleId = useId()
  const months = calendarMonths(days)
  const [index, setIndex] = useState(() => monthIndexAt(months, now))
  const month = months[Math.min(index, months.length - 1)]
  if (month === undefined) return null
  const todayStart = localMidnight(now)

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-2 rounded-card bg-surface px-2 pt-2 pb-5"
    >
      <div className="flex items-center justify-between pl-3">
        <h3 id={titleId} className="text-title" aria-live="polite">
          {formatMonth(month.month)}
        </h3>
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            aria-label={copy.previousMonth}
            disabled={index <= 0}
            className={pagerControl}
            onClick={() => setIndex(index - 1)}
          >
            <ChevronLeft strokeWidth={1.75} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={copy.nextMonth}
            disabled={index >= months.length - 1}
            className={pagerControl}
            onClick={() => setIndex(index + 1)}
          >
            <ChevronRight strokeWidth={1.75} aria-hidden="true" />
          </Button>
        </div>
      </div>

      <table aria-labelledby={titleId} className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {copy.weekdays.map(([letter, name]) => (
              <th key={name} scope="col" className="h-8 font-medium text-muted text-label">
                <span aria-hidden="true">{letter}</span>
                <span className="sr-only">{name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month.weeks.map((week) => (
            <tr key={week.find((cell) => cell !== null)?.day}>
              {week.map((cell, column) => (
                <DayCell
                  // A week's blanks have no date of their own: their column tells them apart.
                  key={cell?.day ?? `blank-${column}`}
                  cell={cell}
                  todayStart={todayStart}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mx-3 border-line border-t pt-4">
        <CalendarLegend />
      </div>
    </section>
  )
}
