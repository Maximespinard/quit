import type { ProtocolPosition } from '@/shared/domain/protocol-position'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/utils/cn'
import { formatDose, formatShortDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import type { CalendarStep } from '../domain/patch-calendar'
import { stepTints } from '../utils/step-tint'

const copy = strings.calendar

type StepSpansProps = {
  steps: readonly CalendarStep[]
  position: ProtocolPosition
}

/**
 * Each step's span over the calendar, from its first patch day to its last. The swatch on each
 * row is the outline the step's days to come carry in the month grid: this card is that tint's legend.
 */
export function StepSpans({ steps, position }: StepSpansProps) {
  const current = position.status === 'running' ? position.stepNumber : null
  const tints = stepTints(steps)

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
              <span
                className={cn('flex items-baseline gap-2.5 text-body', running && 'font-medium')}
              >
                <span
                  aria-hidden="true"
                  className="size-3.5 shrink-0 self-center rounded-sm border-[1.5px]"
                  style={{ borderColor: tints[span.number - 1] }}
                />
                <span>
                  {copy.step(span.number, formatDose(span.step.doseMg))}
                  {running ? (
                    <span className="font-normal text-muted text-label">{copy.current}</span>
                  ) : null}
                </span>
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
