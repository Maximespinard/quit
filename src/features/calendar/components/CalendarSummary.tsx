import { useId } from 'react'
import type { PatchCalendar } from '@/shared/domain/patch-calendar'
import { formatDate, formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { formatWeekdayDate } from '../utils/calendar-dates'

const copy = strings.calendar

type CalendarSummaryProps = Pick<PatchCalendar, 'position' | 'nextStepChange' | 'plannedEnd'>

/**
 * Where the taper stands, read at a glance: the day within the step and the days left, then
 * the date of the next step change (to buy the next box in time) and the planned end.
 */
export function CalendarSummary({ position, nextStepChange, plannedEnd }: CalendarSummaryProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between text-label">
        <h3 id={titleId} className="font-medium text-body text-ink">
          {strings.protocol.title}
        </h3>
        {position.status === 'running' ? (
          <span className="text-muted">
            {strings.protocol.stepOf(position.stepNumber, position.stepCount)}
          </span>
        ) : null}
      </div>

      {position.status === 'running' ? (
        <div className="flex flex-col divide-y divide-line rounded-card bg-surface">
          <div className="flex flex-col gap-1 p-4">
            <p className="text-figure tabular-nums">
              {strings.protocol.day(position.dayInStep, position.step.durationDays)}
            </p>
            <p className="text-muted text-label">
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
          {/* The same statement as the home totals: one rule between equal columns. */}
          <dl className="grid auto-cols-fr grid-flow-col divide-x divide-line py-4">
            {nextStepChange !== null && position.nextStep !== null ? (
              <div className="flex flex-col gap-1 px-4">
                <dt className="text-muted text-label">{copy.nextChange}</dt>
                <dd className="font-medium text-body">{formatWeekdayDate(nextStepChange)}</dd>
                <dd className="text-muted text-label">
                  {copy.nextDose(formatDose(position.nextStep.doseMg))}
                </dd>
              </div>
            ) : null}
            <div className="flex flex-col gap-1 px-4">
              <dt className="text-muted text-label">{copy.plannedEnd}</dt>
              <dd className="font-medium text-body">{formatWeekdayDate(plannedEnd)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="flex flex-col gap-1 rounded-card bg-surface p-4">
          <p className="text-title">{strings.protocol.over}</p>
          <p className="text-muted text-label">{copy.endedOn(formatDate(plannedEnd))}</p>
        </div>
      )}
    </section>
  )
}
