import { useId } from 'react'
import type { CalendarStep } from '@/shared/domain/patch-calendar'
import { cn } from '@/shared/utils/cn'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { formatShortDate } from '../utils/calendar-dates'

const copy = strings.calendar

type StepSpansProps = {
  steps: readonly CalendarStep[]
  /** The running step's number; `null` once the protocol is over. */
  current: number | null
}

/** Each step's span over the calendar, from its first patch day to its last. */
export function StepSpans({ steps, current }: StepSpansProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2.5">
      <h3 id={titleId} className="font-semibold text-body">
        {copy.steps}
      </h3>
      <ol className="flex flex-col divide-y divide-line border-line border-y">
        {steps.map((span) => {
          const running = span.number === current
          return (
            <li key={span.number} className="flex min-h-12 items-center justify-between gap-3">
              <span className={cn('text-body', running && 'font-semibold')}>
                {copy.step(span.number, formatDose(span.step.doseMg))}
                {running ? (
                  <span className="font-normal text-ink-soft text-label">
                    {' · '}
                    {copy.current}
                  </span>
                ) : null}
              </span>
              <span className="text-ink-soft text-label tabular-nums">
                {copy.span(formatShortDate(span.firstDay), formatShortDate(span.lastDay))}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
