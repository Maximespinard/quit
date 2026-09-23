import { Link } from '@tanstack/react-router'
import { useId } from 'react'
import type { ProtocolPosition } from '@/shared/domain/protocol-position'
import { buttonVariants } from '@/shared/ui/base/button'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

const copy = strings.protocol

/** Home screen block: the day within the current step, the days left, and the way to edit. */
export function ProtocolSummary({ position }: { position: ProtocolPosition }) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between text-label">
        <h2 id={titleId} className="font-semibold text-body text-ink">
          {copy.title}
        </h2>
        {position.status === 'running' ? (
          <span className="text-ink-soft">
            {copy.stepOf(position.stepNumber, position.stepCount)}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-card bg-surface p-4">
        {position.status === 'running' ? (
          <div className="flex flex-col gap-1">
            <p className="text-figure tabular-nums">
              {copy.day(position.dayInStep, position.step.durationDays)}
            </p>
            <p className="text-ink-dim text-label">
              {copy.dose(formatDose(position.step.doseMg), position.step.brand)}
              {' · '}
              {position.nextStep === null
                ? copy.untilEnd(position.daysLeft)
                : copy.untilNext(position.daysLeft, formatDose(position.nextStep.doseMg))}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-figure">{copy.over}</p>
            <p className="text-ink-dim text-label">{copy.overLead}</p>
          </div>
        )}
        <Link
          to="/protocol"
          search={(previous) => previous}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {copy.edit}
        </Link>
      </div>
    </section>
  )
}
