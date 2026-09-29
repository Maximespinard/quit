import type { ReactNode } from 'react'
import type { GoalProgress } from '@/shared/domain/derive'
import { useCountUp } from '@/shared/hooks/useCountUp'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { formatEuros } from '@/shared/utils/euros'
import { strings } from '@/shared/utils/strings'

type GoalReachedProps = {
  goal: GoalProgress
  /** The first sight of it: the price counts up and the bar fills, once. */
  celebrating: boolean
  /** The way to set the next goal. */
  action: ReactNode
}

const copy = strings.goal

/** The goal reached: its price met in full, the bar full, then the next one. */
export function GoalReached({ goal, celebrating, action }: GoalReachedProps) {
  const counted = useCountUp(celebrating ? goal.priceCents : 0)
  const shown = celebrating ? counted : goal.priceCents
  const price = formatEuros(goal.priceCents)

  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate font-medium text-body">{goal.label}</p>
          <p className="text-figure tabular-nums">
            <span aria-hidden="true">{formatEuros(shown)}</span>
            <span className="sr-only">{price}</span>
          </p>
        </div>
        {action}
      </div>
      <ProgressBar
        label={copy.barLabel(goal.label)}
        value={shown}
        max={goal.priceCents}
        valueText={copy.progress(price, price)}
      />
      <p className="text-body text-muted">{copy.reachedLead}</p>
    </div>
  )
}
