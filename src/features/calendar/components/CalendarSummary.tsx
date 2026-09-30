import type { PatchCalendar } from '@/shared/domain/patch-calendar'
import { Card } from '@/shared/ui/Card'
import { formatDate, formatDose, formatWeekdayDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

const copy = strings.calendar

/** One statement per row, label left and value right, split by a hairline. */
const row = 'grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-line border-t py-3 last:pb-0'

type CalendarSummaryProps = Pick<PatchCalendar, 'position' | 'nextStepChange' | 'plannedEnd'>

/**
 * Where the taper stands, read at a glance: the day within the step and the days left, then
 * the date of the next step change (to buy the next box in time) and the planned end.
 */
export function CalendarSummary({ position, nextStepChange, plannedEnd }: CalendarSummaryProps) {
  return (
    <Card
      title={strings.protocol.title}
      headingLevel={3}
      aside={
        position.status === 'running' ? (
          <span className="text-muted">
            {strings.protocol.stepOf(position.stepNumber, position.stepCount)}
          </span>
        ) : null
      }
    >
      {position.status === 'running' ? (
        <>
          <div className="flex flex-col gap-1.5">
            <p className="text-figure tabular-nums">
              {strings.protocol.day(position.dayInStep, position.step.durationDays)}
            </p>
            <p className="text-label text-muted">
              {strings.protocol.detail(
                formatDose(position.step.doseMg),
                position.nextStep === null
                  ? strings.protocol.untilEnd(position.daysLeft)
                  : strings.protocol.untilNext(
                      position.daysLeft,
                      formatDose(position.nextStep.doseMg),
                    ),
              )}
            </p>
          </div>
          <dl className="flex flex-col">
            {nextStepChange !== null && position.nextStep !== null ? (
              <div className={row}>
                <dt className="row-span-2 text-label text-muted">{copy.nextChange}</dt>
                <dd className="text-right font-medium text-body">
                  {formatWeekdayDate(nextStepChange)}
                </dd>
                <dd className="col-start-2 text-right text-label text-muted">
                  {copy.nextDose(formatDose(position.nextStep.doseMg))}
                </dd>
              </div>
            ) : null}
            <div className={row}>
              <dt className="text-label text-muted">{copy.plannedEnd}</dt>
              <dd className="text-right font-medium text-body">{formatWeekdayDate(plannedEnd)}</dd>
            </div>
          </dl>
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <p className="text-title">{strings.protocol.over}</p>
          <p className="text-label text-muted">{copy.endedOn(formatDate(plannedEnd))}</p>
        </div>
      )}
    </Card>
  )
}
