import { useId } from 'react'
import type { CalendarStep } from '@/shared/domain/patch-calendar'
import type { ProtocolPosition } from '@/shared/domain/protocol-position'
import { cn } from '@/shared/utils/cn'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { formatShortDate } from '../utils/calendar-dates'

const copy = strings.calendar

type StepSpansProps = {
  steps: readonly CalendarStep[]
  position: ProtocolPosition
}

/** Each step's span over the calendar, from its first patch day to its last. */
export function StepSpans({ steps, position }: StepSpansProps) {
  const titleId = useId()
  const current = position.status === 'running' ? position.stepNumber : null

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-1.5 rounded-card bg-surface p-5"
    >
      <h3 id={titleId} className="text-label text-muted">
        {copy.steps}
      </h3>
      <ol className="flex flex-col divide-y divide-line">
        {steps.map((span) => {
          const running = span.number === current
          return (
            <li
              key={span.number}
              className="flex items-baseline justify-between gap-3 py-3 last:pb-0"
            >
              <span className={cn('text-body', running && 'font-medium')}>
                {copy.step(span.number, formatDose(span.step.doseMg))}
                {running ? (
                  <span className="font-normal text-muted text-label">{copy.current}</span>
                ) : null}
              </span>
              <span className="text-muted text-label tabular-nums">
                {copy.span(formatShortDate(span.firstDay), formatShortDate(span.lastDay))}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
