import type { Step } from '@/shared/domain/protocol'
import { cn } from '@/shared/utils/cn'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { describeDay, formatWeekdayDate } from '../utils/calendar-dates'
import type { MonthCell } from '../utils/calendar-months'
import { CigaretteMark, CravingMark, PatchMark } from './DayMarks'

const copy = strings.calendar

type DayCellProps = {
  cell: MonthCell | null
  steps: readonly Step[]
  /** Local midnight of today: days after it are still to come. */
  today: number
}

/**
 * One date of the month grid: its number, the dose on a step's first day (or the end), then
 * its marks. A screen reader hears the whole day in one sentence instead.
 */
export function DayCell({ cell, steps, today }: DayCellProps) {
  if (cell === null) return <td />
  const { day, calendarDay } = cell
  const date = new Date(day).getDate()
  if (calendarDay === null) {
    return (
      <td className="p-0.5 align-top">
        {/* Outside the calendar: a bare date, before the quit day or after the last one. */}
        <div className="flex h-14 justify-center pt-1.5 text-ink-soft/50 text-label tabular-nums">
          <span aria-hidden="true">{date}</span>
          <span className="sr-only">{formatWeekdayDate(day)}</span>
        </div>
      </td>
    )
  }

  const { step, stepStart, end, patch, cigarettes, cravings } = calendarDay
  const startingStep = stepStart && step !== null ? steps[step - 1] : undefined
  const tag =
    startingStep !== undefined ? copy.dose(formatDose(startingStep.doseMg)) : end ? copy.end : null
  const tinted = calendarDay.today

  return (
    <td className="p-0.5 align-top">
      <div
        className={cn(
          'flex h-14 flex-col items-center justify-between rounded-step pt-1.5 pb-2',
          tinted && 'bg-surface',
          day > today ? 'text-ink-soft' : 'text-ink',
        )}
      >
        <span aria-hidden="true" className={cn('text-label tabular-nums', tinted && 'font-bold')}>
          {date}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'whitespace-nowrap font-semibold text-detail',
            tinted ? 'text-ink-dim' : 'text-ink-soft',
          )}
        >
          {tag}
        </span>
        <span aria-hidden="true" className="flex h-3 items-center gap-0.5 text-ink">
          {patch === null ? null : <PatchMark patch={patch} />}
          {cigarettes > 0 ? <CigaretteMark /> : null}
          {cravings > 0 ? <CravingMark /> : null}
        </span>
        <span className="sr-only">{describeDay(calendarDay, steps)}</span>
      </div>
    </td>
  )
}
