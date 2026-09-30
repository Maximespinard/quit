import { cn } from '@/shared/utils/cn'
import { formatDose, formatWeekdayDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { cravingBucket } from '../domain/craving-bucket'
import { describeDay } from '../utils/calendar-dates'
import type { MonthCell } from '../utils/calendar-months'
import { cravingHeat } from '../utils/craving-heat'
import { CigaretteMark, CravingMark, PatchMark } from './DayMarks'

const copy = strings.calendar

/**
 * Three fixed rows — date, marks, step label — so every cell of a week lines up whatever it holds. The
 * marks sit right under their date; the label row, empty most days, is the gap to the next week.
 * Every cell carries a transparent 1.5 px border, the outline of a day to come.
 */
const cellLayout =
  'flex h-17 flex-col items-center gap-1 rounded-lg border-[1.5px] border-transparent pt-1'
const dateLayout = 'grid size-6 place-items-center rounded-full text-label tabular-nums'

type DayCellProps = {
  cell: MonthCell | null
  /** Local midnight of today: days after it are still to come. */
  todayStart: number
  /** The outline colour of each step, in step order. */
  tints: readonly string[]
}

/**
 * One date of the month grid: its number, its marks, then the dose on a step's first day (or
 * the end). A screen reader hears the whole day in one sentence instead.
 */
export function DayCell({ cell, todayStart, tints }: DayCellProps) {
  if (cell === null) return <td />
  const { day, calendarDay } = cell
  const date = new Date(day).getDate()
  if (calendarDay === null) {
    return (
      <td className="p-0.5 align-top">
        {/* Outside the calendar: a bare date, dimmer than any day to come, still 4.5:1 on the card. */}
        <div className={cn(cellLayout, 'text-muted/80')}>
          <span aria-hidden="true" className={dateLayout}>
            {date}
          </span>
          <span className="sr-only">{formatWeekdayDate(day)}</span>
        </div>
      </td>
    )
  }

  const { startingStep, step, isEnd, isToday, patch, cigarettes, cravings } = calendarDay
  const stepLabel =
    startingStep !== null ? copy.dose(formatDose(startingStep.doseMg)) : isEnd ? copy.end : null
  // One meaning per cell: a lived day of the protocol is filled, a day to come is outlined.
  const lived = step !== null && day <= todayStart
  const heat = lived ? cravingHeat[cravingBucket(cravings)] : undefined
  const outline = step !== null && !lived ? tints[step - 1] : undefined

  return (
    <td className="p-0.5 align-top">
      <div
        className={cn(cellLayout, day > todayStart ? 'text-muted' : 'text-ink')}
        style={{
          ...(heat === undefined ? null : { backgroundColor: heat }),
          ...(outline === undefined ? null : { borderColor: outline }),
        }}
      >
        {/* Today is the one lit date: the cream of the primary pill. */}
        <span
          aria-hidden="true"
          className={cn(dateLayout, isToday && 'bg-ink font-medium text-page')}
        >
          {date}
        </span>
        <span aria-hidden="true" className="flex h-3.5 items-center gap-1">
          {patch === null || patch === 'logged' ? null : <PatchMark patch={patch} />}
          {cigarettes > 0 ? <CigaretteMark /> : null}
          {cravings > 0 ? <CravingMark count={cravings} /> : null}
        </span>
        <span aria-hidden="true" className="flex h-4 items-center">
          {stepLabel === null ? null : (
            <span className="whitespace-nowrap rounded-full bg-ghost px-1.5 font-medium text-detail leading-4">
              {stepLabel}
            </span>
          )}
        </span>
        <span className="sr-only">{describeDay(calendarDay)}</span>
      </div>
    </td>
  )
}
