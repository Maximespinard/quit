import { Link } from '@tanstack/react-router'
import type { ProtocolPosition } from '@/shared/domain/protocol-position'
import { buttonVariants } from '@/shared/ui/base/button'
import { Card } from '@/shared/ui/Card'
import { keepSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

const copy = strings.protocol

const editAction = cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'shrink-0')

/** Home screen block: the current step, the day within it, the days left, and the way to edit. */
export function ProtocolSummary({ position }: { position: ProtocolPosition }) {
  const edit = (
    <Link to="/protocol" search={keepSearch} className={editAction}>
      {copy.edit}
    </Link>
  )

  return (
    <Card title={copy.title}>
      {position.status === 'running' ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-title tabular-nums">
                {copy.stepOf(position.stepNumber, position.stepCount)}
              </p>
              <p className="text-body text-muted">
                {copy.detail(
                  formatDose(position.step.doseMg),
                  position.nextStep === null
                    ? copy.untilEnd(position.daysLeft)
                    : copy.untilNext(position.daysLeft, formatDose(position.nextStep.doseMg)),
                )}
              </p>
            </div>
            {edit}
          </div>
          <div className="flex flex-col gap-1 text-body text-muted">
            <p className="tabular-nums">
              {copy.day(position.dayInStep, position.step.durationDays)}
            </p>
            {position.step.brand !== undefined ? (
              <p className="truncate">{position.step.brand}</p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-title">{copy.over}</p>
            <p className="text-body text-muted">{copy.overLead}</p>
          </div>
          {edit}
        </div>
      )}
    </Card>
  )
}
