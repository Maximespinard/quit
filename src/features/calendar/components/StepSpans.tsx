import type { ProtocolPosition } from '@/shared/domain/protocol-position'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/utils/cn'
import { formatDose, formatShortDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import type { CalendarStep } from '../domain/patch-calendar'

const copy = strings.calendar

type StepSpansProps = {
  steps: readonly CalendarStep[]
  position: ProtocolPosition
}

/** Each step's span over the calendar, from its first patch day to its last. */
export function StepSpans({ steps, position }: StepSpansProps) {
  const current = position.status === 'running' ? position.stepNumber : null

  return (
    <Card title={copy.steps} headingLevel={3} className="gap-1.5">
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
    </Card>
  )
}
